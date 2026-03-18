const express = require('express');
const router = express.Router();
const Cos = require('../models/Cos');

// 1. GET: Aducem coșul utilizatorului și îl curățăm de fantome
router.get('/:userId', async (req, res) => {
    try {
        // Căutăm coșul și folosim .populate() pentru a aduce și detaliile cărților
        const cos = await Cos.findOne({ userId: req.params.userId }).populate('produse.carteId');
        
        if (!cos) {
            // Dacă nu are coș încă, returnăm un array gol
            return res.status(200).json({ produse: [] });
        }

        // --- FILTRUL MAGIC ÎNCEPE AICI ---
        // Păstrăm doar produsele unde carteId nu este null (cartea încă există în baza de date)
        const produseValide = cos.produse.filter(p => p.carteId !== null);

        // Dacă lungimea array-ului s-a modificat, înseamnă că am avut produse șterse ("fantome")
        if (produseValide.length !== cos.produse.length) {
            cos.produse = produseValide;
            await cos.save(); // Salvăm coșul curățat definitiv în baza de date
        }
        // --- FILTRUL MAGIC SE TERMINĂ AICI ---

        res.status(200).json(cos);
    } catch (error) {
        res.status(500).json({ message: "Eroare la preluarea coșului", error });
    }
});

// 2. POST: Adăugăm un produs în coș
router.post('/adauga', async (req, res) => {
    const { userId, carteId, cantitate } = req.body;

    try {
        let cos = await Cos.findOne({ userId });

        if (cos) {
            // Verificăm dacă produsul există deja în coș
            const indexProdus = cos.produse.findIndex(p => p.carteId.toString() === carteId);

            if (indexProdus > -1) {
                // Dacă există, doar îi creștem cantitatea
                cos.produse[indexProdus].cantitate += cantitate || 1;
            } else {
                // Dacă nu există, îl adăugăm în array
                cos.produse.push({ carteId, cantitate: cantitate || 1 });
            }
            cos = await cos.save();
            return res.status(200).json(cos);
        } else {
            // Dacă utilizatorul NU are coș, îi creăm unul nou
            const cosNou = await Cos.create({
                userId,
                produse: [{ carteId, cantitate: cantitate || 1 }]
            });
            return res.status(201).json(cosNou);
        }
    } catch (error) {
        res.status(500).json({ message: "Eroare la adăugarea în coș", error });
    }
});

module.exports = router;