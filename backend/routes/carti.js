const express = require('express');
const router = express.Router();
const Carte = require('../models/Carte'); // Importăm modelul tău perfect aliniat cu diagrama

// 1. Rută pentru a extrage toate cărțile din baza de date
router.get('/', async (req, res) => {
    try {
        const carti = await Carte.find();
        res.json(carti);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la extragerea cărților' });
    }
});

// 2. Rută TEMPORARĂ pentru a adăuga rapid 3 cărți de test (Seed)
router.post('/seed', async (req, res) => {
    try {
        const cartiTest = [
            { isbn: "978-606", titlu: "Atomic Habits", autor: "James Clear", editura: "Lifestyle", pret: 55, stoc: 20, imagine_url: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Atomic+Habits" },
            { isbn: "978-973", titlu: "Scurtă istorie a omenirii", autor: "Yuval Noah Harari", editura: "Polirom", pret: 65, stoc: 15, imagine_url: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Harari" },
            { isbn: "978-555", titlu: "Arta subtilă a nepăsării", autor: "Mark Manson", editura: "Lifestyle", pret: 45, stoc: 10, imagine_url: "https://via.placeholder.com/150/008000/FFFFFF?text=Mark+Manson" }
        ];
        
        // Inserăm cărțile doar dacă baza de date e goală, ca să nu le dublăm
        const count = await Carte.countDocuments();
        if (count === 0) {
            await Carte.insertMany(cartiTest);
            res.json({ mesaj: 'Cărțile de test au fost adăugate cu succes!' });
        } else {
            res.status(400).json({ mesaj: 'Cărțile există deja în baza de date!' });
        }
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la adăugarea cărților', eroare });
    }
});

module.exports = router;