const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importăm modelul User

//register
router.post('/register', async (req, res) => {
    try {
        // Extragem email-ul și parola trimise de pe frontend
        const { email, parola } = req.body;

        // 1. Verificăm dacă utilizatorul există deja în baza de date
        const userExistent = await User.findOne({ email });
        if (userExistent) {
            return res.status(400).json({ mesaj: 'Acest email este deja folosit!' });
        }

        // 2. Criptăm parola 
        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt);

        // 3. Creăm și salvăm noul utilizator
        const newUser = new User({
            email,
            parola: parolaCriptata
        });

        await newUser.save();
        res.status(201).json({ mesaj: 'Cont creat cu succes!' });

    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la server în timpul înregistrarii.', eroare });
    }
});

//login
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        // 1. Verificăm dacă există un cont cu acest email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecte!' });
        }

        // 2. Comparăm parola introdusă cu cea criptată din baza de date
        const parolaValida = await bcrypt.compare(parola, user.parola);
        if (!parolaValida) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecte!' });
        }

        // 3. Dacă totul e ok, generăm un Token valabil 30 min
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30min' }
        );

        res.json({ mesaj: 'Autentificare reusita!', token });

    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la server în timpul autentificarii.', eroare });
    }
});

module.exports = router;