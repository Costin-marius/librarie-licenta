const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const Comanda = require('../models/Comanda');

// Middleware pentru a verifica dacă utilizatorul este logat (are token valid)
const verificaToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ mesaj: 'Acces refuzat. Nu ești logat!' });

    try {
        const decodat = jwt.verify(token, process.env.JWT_SECRET || 'secret_temporar');
        req.userId = decodat.id;
        next();
    } catch (eroare) {
        res.status(403).json({ mesaj: 'Token invalid sau expirat!' });
    }
};

// 1. IA DATELE PROFILULUI ȘI WISHLIST-UL
router.get('/profil', verificaToken, async (req, res) => {
    try {
        // Căutăm userul și aducem automat și detaliile cărților din wishlist (populate)
        const user = await User.findById(req.userId).populate('wishlist').select('-parola');
        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
        res.json(user);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
});

// GET WISHLIST
router.get('/wishlist', verificaToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist');
        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
        res.json(user.wishlist);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare server wishlist' });
    }
});

// GET COS
router.get('/cos', verificaToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('cos.carte');
        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
        res.json(user.cos);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare server cos' });
    }
});

router.get('/comenzi', verificaToken, async (req, res) => {
    try {
        // req.userId vine direct din token (deci e imposibil de falsificat)
        const comenzi = await Comanda.find({ utilizator: req.userId }).sort({ createdAt: -1 });
        res.json(comenzi);
    } catch (eroare) {
        console.error("Eroare la extragerea comenzilor:", eroare);
        res.status(500).json({ mesaj: 'Eroare la aducerea istoricului de comenzi.' });
    }
});

// 2. ACTUALIZEAZĂ NUMELE ȘI ADRESA
router.put('/actualizare', verificaToken, async (req, res) => {
    try {
        const { nume, adresa } = req.body;
        const userActualizat = await User.findByIdAndUpdate(
            req.userId, 
            { nume, adresa }, 
            { new: true }
        ).select('-parola');
        
        res.json({ mesaj: 'Profil actualizat cu succes!', user: userActualizat });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la actualizare' });
    }
});

// 3. SCHIMBĂ PAROLA
router.put('/schimba-parola', verificaToken, async (req, res) => {
    try {
        const { parolaVeche, parolaNoua } = req.body;
        const user = await User.findById(req.userId);

        const parolaCorecta = await bcrypt.compare(parolaVeche, user.parola);
        if (!parolaCorecta) return res.status(400).json({ mesaj: 'Parola veche este incorectă!' });

        const salt = await bcrypt.genSalt(10);
        user.parola = await bcrypt.hash(parolaNoua, salt);
        await user.save();

        res.json({ mesaj: 'Parola a fost schimbată cu succes!' });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la schimbarea parolei' });
    }
});

// 4. ADAUGĂ / SCOATE O CARTE DIN WISHLIST
router.post('/wishlist/toggle', verificaToken, async (req, res) => {
    try {
        const { carteId } = req.body;
        const user = await User.findById(req.userId);

        // Verificăm dacă cartea e deja în wishlist
        const esteInWishlist = user.wishlist.includes(carteId);

        if (esteInWishlist) {
            // O scoatem
            user.wishlist = user.wishlist.filter(id => id.toString() !== carteId);
        } else {
            // O adăugăm
            user.wishlist.push(carteId);
        }

        await user.save();
        res.json({ 
            mesaj: esteInWishlist ? 'Carte ștearsă din wishlist!' : 'Carte adăugată în wishlist!',
            wishlist: user.wishlist 
        });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la modificarea wishlist-ului' });
    }
});

// 5. ADAUGĂ O CARTE ÎN COȘ
router.post('/cos/adauga', verificaToken, async (req, res) => {
    try {
        const { carteId, cantitate = 1 } = req.body; // Dacă nu trimitem cantitate, punem 1 din oficiu
        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });

        // Verificăm dacă cartea este deja în coș
        const carteExistentIndex = user.cos.findIndex(item => item.carte.toString() === carteId);

        if (carteExistentIndex >= 0) {
            // Dacă e deja în coș, doar creștem cantitatea
            user.cos[carteExistentIndex].cantitate += cantitate;
        } else {
            // Dacă nu e în coș, o adăugăm ca obiect nou
            user.cos.push({ carte: carteId, cantitate });
        }

        await user.save();
        res.json({ mesaj: 'Carte adăugată în coș!', cos: user.cos });
    } catch (eroare) {
        console.error("Eroare la adăugarea în coș:", eroare);
        res.status(500).json({ mesaj: 'Eroare la adăugarea în coș.' });
    }
});

// 6. SCOATE O CARTE DIN COȘ SAU SCADE CANTITATEA
router.post('/cos/sterge', verificaToken, async (req, res) => {
    try {
        const { carteId, stergeDeTot } = req.body; // Dacă 'stergeDeTot' e true, ștergem cartea complet din coș
        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });

        const carteExistentIndex = user.cos.findIndex(item => item.carte.toString() === carteId);

        if (carteExistentIndex >= 0) {
            if (stergeDeTot || user.cos[carteExistentIndex].cantitate <= 1) {
                // Dacă am cerut ștergere completă SAU avem doar o bucată, o scoatem de tot din array
                user.cos.splice(carteExistentIndex, 1);
            } else {
                // Altfel, doar scădem cantitatea cu 1
                user.cos[carteExistentIndex].cantitate -= 1;
            }
            await user.save();
            res.json({ mesaj: 'Coș actualizat!', cos: user.cos });
        } else {
            res.status(404).json({ mesaj: 'Cartea nu este în coș.' });
        }
    } catch (eroare) {
        console.error("Eroare la modificarea coșului:", eroare);
        res.status(500).json({ mesaj: 'Eroare la modificarea coșului.' });
    }
});

router.delete('/cos/goleste', verificaToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
        }
        user.cos = [];
        await user.save();

        res.status(200).json({ mesaj: 'Coșul a fost golit cu succes!', cos: user.cos });
    } catch (eroare) {
        console.error("Eroare la golirea coșului:", eroare);
        res.status(500).json({ mesaj: 'Eroare la golirea coșului.' });
    }
});
module.exports = router;