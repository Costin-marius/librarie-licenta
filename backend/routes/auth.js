const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User'); 
const { trimiteEmail } = require('../services/emailService');

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
            nume: user.nume,
            userId: user._id
        });
    } catch (eroare) {
        console.error("Eroare la login:", eroare);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ mesaj: 'Nu există niciun cont cu acest email.' });
        }

        // Generează token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Setează tokenul și expirarea (1 oră)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000;

        await user.save();

        // Creăm URL-ul pentru resetare (spre Frontend)
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const continutEmail = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fcfcfc;">
                <h2 style="color: #ea580c; text-align: center;">Resetare parolă cont BookIo</h2>
                <p style="font-size: 16px; color: #333;">Salut, <strong>${user.nume}</strong>,</p>
                <p style="font-size: 15px; color: #555;">Ai solicitat resetarea parolei pentru contul tău. Te rugăm să accesezi butonul de mai jos pentru a alege o parolă nouă.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Resetează parola
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #555;">Dacă nu tu ai solicitat acest lucru, te rugăm să ignori acest e-mail. Linkul va expira într-o oră.</p>
                <br/>
                <p style="font-size: 14px; color: #777;">Echipa BookIo</p>
            </div>
        `;

        try {
            await trimiteEmail(user.email, 'Resetare parolă - BookIo', continutEmail);
            res.status(200).json({ mesaj: 'Emailul de resetare a fost trimis.' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ mesaj: 'Eroare la trimiterea emailului.' });
        }
    } catch (eroare) {
        console.error("Eroare la forgot password:", eroare);
        res.status(500).json({ mesaj: 'Eroare pe server.' });
    }
});

// RESET PASSWORD
router.put('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = req.params.token;

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ mesaj: 'Tokenul este invalid sau a expirat.' });
        }

        // Setăm noua parolă
        const salt = await bcrypt.genSalt(10);
        user.parola = await bcrypt.hash(req.body.parola, salt);

        // Curățăm câmpurile temporare
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ mesaj: 'Parola a fost resetată cu succes!' });
    } catch (eroare) {
        console.error("Eroare la reset password:", eroare);
        res.status(500).json({ mesaj: 'Eroare pe server.' });
    }
});

module.exports = router;