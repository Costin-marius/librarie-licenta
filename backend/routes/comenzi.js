const express = require('express');
const router = express.Router();
const Comanda = require('../models/Comanda');
const Carte = require('../models/Carte');

// Rută pentru plasarea unei comenzi noi
router.post('/', async (req, res) => {
    try {
        const { dateLivrare, produse, total, metodaPlata } = req.body;

        // 1. Salvăm comanda în baza de date
        const nouaComanda = new Comanda({
            dateLivrare,
            produse,
            total,
            metodaPlata
        });
        await nouaComanda.save();

        // 2. Scădem stocul pentru FIECARE carte cumpărată
        for (let item of produse) {
            await Carte.findByIdAndUpdate(item.carteId, {
                $inc: { stoc: -item.cantitate } // "$inc" cu minus înseamnă scădere din stoc
            });
        }

        res.status(201).json({ mesaj: 'Comanda a fost plasată cu succes și stocul a fost actualizat!' });
    } catch (eroare) {
        console.error("Eroare la procesarea comenzii:", eroare);
        res.status(500).json({ mesaj: 'Eroare la plasarea comenzii', eroare });
    }
});

// Rută pentru Admin ca să vadă toate comenzile (cea mai nouă prima)
router.get('/', async (req, res) => {
    try {
        const comenzi = await Comanda.find().sort({ createdAt: -1 });
        res.json(comenzi);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la extragerea comenzilor' });
    }
});

module.exports = router;