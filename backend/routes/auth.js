const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola } = req.body;
        
        const userExistent = await User.findOne({ email });
        if (userExistent) return res.status(400).json({ mesaj: 'Email deja folosit!' });

        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt);

        const rolAtribuit = email === 'admin@admin.com' ? 'admin' : 'client';

        const userNou = new User({ 
            nume, 
            email, 
            parola: parolaCriptata, 
            rol: rolAtribuit 
        });
        
        await userNou.save();

        res.status(201).json({ mesaj: 'Cont creat cu succes!' });
    } catch (eroare) {
        console.error("Eroare la înregistrare:", eroare);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ mesaj: 'Email sau parolă greșită!' });

        const parolaCorecta = await bcrypt.compare(parola, user.parola);
        if (!parolaCorecta) return res.status(400).json({ mesaj: 'Email sau parolă greșită!' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_temporar', { expiresIn: '1h' });

        res.json({ 
            token, 
            rol: user.rol,
            nume: user.nume 
        });
    } catch (eroare) {
        console.error("Eroare la login:", eroare);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
});

module.exports = router;