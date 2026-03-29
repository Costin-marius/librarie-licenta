const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Carte = require('../models/Carte');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Prompt refacut pentru sistem cu tag-uri simple
const SYSTEM_PROMPT = `
CRITIC: Numele tău ESTE Buki. Ești asistentul virtual oficial al librăriei BookIo. Nu spune niciodată că nu ai un nume.
Ești prietenos și natural.
Când utilizatorul îți cere o carte, un autor sau o editură, și vrei să cauți în baza de date, scrie textul tău normal, iar la finalul mesajului adaugă EXACT acest tag: [CAUTA: numele_cartii_sau_autorului]. Fără JSON, fără alte paranteze.
Exemplu: "Sigur, hai să vedem ce avem de Robert Kiyosaki! [CAUTA: Robert Kiyosaki]".
Dacă utilizatorul îți cere o carte sub un anumit preț (ex: "cărți la 70 de lei"), folosește acest tag la finalul mesajului: [PRET_MAX: 70].
Dacă nu e nevoie să cauți, nu pune tag-ul.
`;

router.post('/', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const history = req.body.history || [];

        // Ne asigurăm că trimitem un array valid de mesaje
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: userMessage }
        ];

        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            max_tokens: 800,
            temperature: 0.3
        });

        const responseMessage = chatCompletion.choices[0].message;
        let content = responseMessage.content || "";
        
        let actionPayload = null;
        let actionReply = "";
        let foundBooks = [];

        // Interceptarea tag-ului simplu de căutare din text
        const customTagRegex = /\[CAUTA:\s*(.*?)\]/i;
        const tagMatch = content.match(customTagRegex);

        if (tagMatch) {
            // Extragem numele dorit, stergem white-case-urile din extreme
            const queryExtracted = tagMatch[1].trim();
            actionPayload = { query: queryExtracted };

            // Ștergem tag-ul din conținutul care va fi afișat utilizatorului
            content = content.replace(tagMatch[0], '').trim();
        }

        // Interceptarea noului tag de pret
        const priceRegex = /\[PRET_MAX:\s*(\d+)\]/i;
        const priceMatch = content.match(priceRegex);

        if (priceMatch) {
            const priceExtracted = parseInt(priceMatch[1].trim(), 10);
            if (!actionPayload) actionPayload = { query: "" };
            actionPayload.maxPrice = priceExtracted;

            content = content.replace(priceMatch[0], '').trim();
        }

        // Daca avem o actiune pe baza tagurilor AI, interogam Mongoose-ul
        if (actionPayload) {
            // Transformăm input-ul într-o expresie capabilă să găsească rezultatele chiar dacă clientul/AI-ul omite diacritice sau scrie fără spații perfecte
            let cleanQuery = (actionPayload.query || "").trim();
            let forgivingRegexStr = cleanQuery.replace(/[\s\W]+/g, '.*'); // Inlocuieste spatiile, cratimele, virgulele cu wildcard '.*'
            const regexQuery = new RegExp(forgivingRegexStr, "i");

            try {
                let dbQuery = {
                    $or: [
                        { titlu: regexQuery },
                        { autor: regexQuery },
                        { editura: regexQuery },
                        { categorie: regexQuery }
                    ]
                };

                // Adăugăm logică flexibilă de preț
                if (actionPayload.maxPrice && !isNaN(actionPayload.maxPrice)) {
                    dbQuery.pret = { $lte: actionPayload.maxPrice };
                }


                // Mongoose .find() va aduce și campurile suplimentare necesare UI-ului (incluzand imaginile lipsă)
                foundBooks = await Carte.find(dbQuery)
                                        .select('_id titlu autor pret imagine imagine_url descriere editura categorie anPublicare nrPagini')
                                        .limit(3); 
                
                // Folosim răspunsul chatului AI dacă a generat unul, altfel un text fallback prietenos
                if (content && content.trim().length > 0) {
                    actionReply = content.trim();
                    if (foundBooks.length === 0) {
                        actionReply += "\n\n(Cu toate acestea, din păcate momentan nu avem în stoc cărți exact cu aceste criterii.)";
                    }
                } else {
                    actionReply = foundBooks.length > 0 
                        ? "Uite ce am găsit pentru tine în librăria noastră:" 
                        : "Îmi pare rău, dar momentan n-am găsit nicio carte stocată exact pentru această căutare.";
                }
            } catch (dbError) {
                console.error("Eroare cautare BD carti:", dbError);
                actionReply = "Ne cerem scuze, am întâmpinat o mică problemă tehnică.";
            }

            return res.json({
                type: "BOOK_RECOMMENDATIONS",
                payload: foundBooks,
                reply: actionReply,
                text: actionReply // asigurat pentru formatul cerut de frontend
            });
        }

        // Returnăm mesajul text normal
        return res.json({
            type: "TEXT",
            reply: content || "Nu am putut genera un răspuns."
        });

    } catch (error) {
        console.error("Eroare la apelul Groq:", error);
        res.status(500).json({ error: "A apărut o eroare la comunicarea cu asistentul.", details: error.message });
    }
});

module.exports = router;
