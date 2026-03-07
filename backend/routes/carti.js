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
//adăugarea unei cărți noi din formular
router.post('/', async (req, res) => {
    try {
        // req.body conține datele trimise din formularul de pe frontend
        const nouaCarte = new Carte(req.body); 
        const carteSalvata = await nouaCarte.save();
        
        res.status(201).json({ mesaj: 'Cartea a fost adăugată cu succes!', carte: carteSalvata });
    } catch (eroare) {
        res.status(400).json({ mesaj: 'Eroare la adăugarea cărții. Verifică datele!', eroare });
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

//ruta delete
router.delete('/:id', async (req, res) => {
    try {
        const carteStearsa = await Carte.findByIdAndDelete(req.params.id);
        if (!carteStearsa) {
            return res.status(404).json({ mesaj: 'Cartea nu a fost găsită!' });
        }
        res.json({ mesaj: 'Cartea a fost ștearsă cu succes!' });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la ștergerea cărții', eroare });
    }
});

//actualizarea unei carti
router.put('/:id', async (req, res) => {
    try {
        const carteActualizata = await Carte.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Îi spunem să ne returneze varianta nouă, actualizată
        );
        if (!carteActualizata) {
            return res.status(404).json({ mesaj: 'Cartea nu a fost găsită!' });
        }
        res.json({ mesaj: 'Cartea a fost actualizată!', carte: carteActualizata });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la actualizarea cărții', eroare });
    }
});

module.exports = router;