const express = require('express');
const router = express.Router();
const Comanda = require('../models/Comanda');
const Carte = require('../models/Carte');

// 1. Rută pentru plasarea unei comenzi noi
router.post('/', async (req, res) => {
    try {
        const { dateLivrare, produse, total, metodaPlata, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ mesaj: 'Trebuie să fii logat pentru a plasa o comandă!' });
        }

        // Salvăm comanda în baza de date și o legăm de utilizator
        const nouaComanda = new Comanda({
            utilizator: userId,
            dateLivrare,
            produse,
            total,
            metodaPlata,
            stare: 'Plasată' // Setăm explicit starea inițială
        });
        
        await nouaComanda.save();

        // Scădem stocul pentru FIECARE carte cumpărată
        for (let item of produse) {
            await Carte.findByIdAndUpdate(item.carteId, {
                $inc: { stoc: -item.cantitate } 
            });
        }

        res.status(201).json({ mesaj: 'Comanda a fost plasată cu succes!', comanda: nouaComanda });
    } catch (eroare) {
        console.error("Eroare la procesarea comenzii:", eroare);
        res.status(500).json({ mesaj: 'Eroare la plasarea comenzii', eroare });
    }
});

router.get('/', async (req, res) => {
    try {
        const comenzi = await Comanda.find().sort({ createdAt: -1 });
        res.json(comenzi);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la extragerea comenzilor' });
    }
});

module.exports = router;