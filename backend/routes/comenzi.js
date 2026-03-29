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

        const stariPermise = ['Plasată', 'În procesare', 'Expediată', 'Livrată', 'Anulată'];
        if (!stariPermise.includes(stare)) {
             return res.status(400).json({ mesaj: 'Status invalid!' });
        }

        const comandaVeche = await Comanda.findById(comandaId);
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