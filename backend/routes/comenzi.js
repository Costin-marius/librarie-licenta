const express = require('express');
const router = express.Router();
const Comanda = require('../models/Comanda');
const Carte = require('../models/Carte');
const User = require('../models/User');
const { trimiteEmail } = require('../services/emailService');

// 1. Rută pentru plasarea unei comenzi noi
router.post('/', async (req, res) => {
    try {
        const { dateLivrare, produse, total, metodaPlata, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ mesaj: 'Trebuie să fii logat pentru a plasa o comandă!' });
        }

        // Determinăm starea inițială pe baza metodei de plată
        const stareInitiala = metodaPlata === 'card' ? 'Plată în așteptare' : 'Plasată';

        // Salvăm comanda în baza de date și o legăm de utilizator
        const nouaComanda = new Comanda({
            utilizator: userId,
            dateLivrare,
            produse,
            total,
            metodaPlata,
            stare: stareInitiala // Setăm explicit starea
        });
        
        await nouaComanda.save();

        if (stareInitiala === 'Plasată') {
            // Scădem stocul pentru FIECARE carte cumpărată DOAR dacă e 'Plasată'
            for (let item of produse) {
                await Carte.findByIdAndUpdate(item.carteId, {
                    $inc: { stoc: -item.cantitate } 
                });
            }

            // Trimitem email de confirmare
            try {
                const user = await User.findById(userId);
                if (user && user.email) {
                    const continut = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fcfcfc;">
                            <h2 style="color: #ea580c; text-align: center;">Comanda ta a fost înregistrată cu succes!</h2>
                            <p style="font-size: 16px; color: #333;">Salut, <strong>${user.nume}</strong>,</p>
                            <p style="font-size: 15px; color: #555;">Îți mulțumim pentru comanda plasată pe magazinul nostru!</p>
                            
                            <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>📦 Număr Comandă:</strong> <span style="color: #2563eb;">${nouaComanda._id}</span></p>
                                <p style="margin: 5px 0;"><strong>💰 Total de plată:</strong> <span style="font-weight: bold; color: #16a34a;">${total} RON</span> (Plată ramburs)</p>
                            </div>
                            
                            <p style="font-size: 15px; color: #555;">Te vom notifica imedat ce coletul tău părăsește depozitul nostru.</p>
                            <br/>
                            <p style="font-size: 14px; color: #777;">Cu drag,<br/><strong>Echipa BookIo</strong></p>
                        </div>
                    `;
                    await trimiteEmail(user.email, 'Comanda ta a fost înregistrată cu succes!', continut);
                }
            } catch (errEmail) {
                console.error("Nu am putut trimite email-ul la plasarea comenzii:", errEmail);
            }
        }

        res.status(201).json({ mesaj: 'Comanda a fost procesată cu succes!', comanda: nouaComanda });
    } catch (eroare) {
        console.error("Eroare la procesarea comenzii:", eroare);
        res.status(500).json({ mesaj: 'Eroare la plasarea/procesarea comenzii', eroare });
    }
});
router.get('/statistici/vanzari', async (req, res) => {
    try {
        // Calculăm data de acum 7 zile
        const sapteZileInUrma = new Date();
        sapteZileInUrma.setDate(sapteZileInUrma.getDate() - 7);

        // Facem agregarea în baza de date
        const statistici = await Comanda.aggregate([
            {
                // Luăm doar comenzile mai noi de acum 7 zile și tranzacționate valid
                $match: {
                    createdAt: { $gte: sapteZileInUrma },
                    stare: { $in: ['În procesare', 'Expediată', 'Livrată'] } // FĂRĂ 'Anulată' sau 'Plasată' (în așteptare neplătită)
                }
            },
            {
                // Grupăm pe zile și adunăm banii / numărul de comenzi
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } }, // Formatăm ca Zi-Luna-An
                    incasari: { $sum: "$total" },
                    comenzi: { $sum: 1 }
                }
            },
            {
                // Sortăm crescător
                $sort: { _id: 1 }
            }
        ]);

        // Redenumim _id în "data" pentru a fi mai ușor de citit în Frontend și rotunjim sumele pentru a rezolva problema de 'floating point math' din JS
        const dateFormatate = statistici.map(stat => ({
            data: stat._id,
            incasari: Math.round(stat.incasari * 100) / 100, // Evită sumele de genul 6539.69999999
            comenzi: stat.comenzi
        }));

        res.status(200).json(dateFormatate);
    } catch (error) {
        console.error("Eroare la statistici:", error);
        res.status(500).json({ mesaj: "Eroare la aducerea statisticilor pentru grafic." });
    }
});
// 2. Rută pentru obținerea tuturor comenzilor (Admin)
router.get('/', async (req, res) => {
    try {
        const comenzi = await Comanda.find().sort({ createdAt: -1 });
        res.json(comenzi);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la extragerea comenzilor' });
    }
});

// 3. Rută pentru actualizarea statusului
router.patch('/:id/status', async (req, res) => {
    try {
        const { stare } = req.body;
        const comandaId = req.params.id;

        const stariPermise = ['Plată în așteptare', 'Plasată', 'În procesare', 'Expediată', 'Livrată', 'Anulată'];
        if (!stariPermise.includes(stare)) {
             return res.status(400).json({ mesaj: 'Status invalid!' });
        }

        const comandaVeche = await Comanda.findById(comandaId).populate('utilizator');
        if (!comandaVeche) {
            return res.status(404).json({ mesaj: 'Comanda nu a fost găsită!' });
        }

        if (stare === 'Anulată' && comandaVeche.stare !== 'Anulată') {
            for (let item of comandaVeche.produse) {
                await Carte.findByIdAndUpdate(item.carteId, {
                    $inc: { stoc: item.cantitate } // Aici dăm + la stoc
                });
            }
        } 
        else if (comandaVeche.stare === 'Anulată' && stare !== 'Anulată') {
             for (let item of comandaVeche.produse) {
                await Carte.findByIdAndUpdate(item.carteId, {
                    $inc: { stoc: -item.cantitate } 
                });
            }
        }

        // 3. Abia acum actualizăm comanda cu noul status
        comandaVeche.stare = stare;
        const comandaActualizata = await comandaVeche.save();

        // Trimitem email dacă a fost expediată
        if (stare === 'Expediată' && comandaVeche.utilizator && comandaVeche.utilizator.email) {
            try {
                const continut = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f8fafc;">
                        <h2 style="color: #2563eb; text-align: center;">Vești bune: Comanda ta a fost expediată! 🚚</h2>
                        <p style="font-size: 16px; color: #333;">Salutare, <strong>${comandaVeche.utilizator.nume || 'cititorule'}</strong>,</p>
                        
                        <p style="font-size: 15px; color: #555;">Comanda ta cu numărul <strong style="color: #2563eb;">${comandaVeche._id}</strong> a fost predată curierului și este pe drum spre tine.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="background-color: #ea580c; color: white; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                AWB Generat
                            </span>
                        </div>
                        
                        <p style="font-size: 15px; color: #555;">Curierul te va contacta telefonic înainte de a ajunge la adresa de livrare.</p>
                        <br/>
                        <p style="font-size: 14px; color: #777;">Mulțumim,<br/><strong>Echipa BookIo</strong></p>
                    </div>
                `;
                await trimiteEmail(comandaVeche.utilizator.email, 'Comanda ta a fost expediată!', continut);
            } catch (errEmail) {
                console.error("Eroare trimitere email expediere:", errEmail);
            }
        }

        res.json({ mesaj: 'Status actualizat cu succes', comanda: comandaActualizata });

    } catch (eroare) {
        console.error("Eroare la actualizarea statusului:", eroare);
        res.status(500).json({ mesaj: 'Eroare la actualizarea statusului' });
    }
});

// 4. Rută pentru ștergerea unei comenzi
router.delete('/:id', async (req, res) => {
    try {
        const comandaId = req.params.id;
        
        // Căutăm și ștergem comanda după ID
        const comandaStearsa = await Comanda.findByIdAndDelete(comandaId);

        if (!comandaStearsa) {
            return res.status(404).json({ mesaj: 'Comanda nu a fost găsită pentru a fi ștearsă.' });
        }

        res.status(200).json({ mesaj: 'Comanda a fost ștearsă cu succes!' });
    } catch (eroare) {
        console.error("Eroare la ștergerea comenzii:", eroare);
        res.status(500).json({ mesaj: 'Eroare pe server la ștergerea comenzii.' });
    }
});

module.exports = router;