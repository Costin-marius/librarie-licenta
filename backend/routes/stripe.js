const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Comanda = require('../models/Comanda');

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { produse, totalFinal, userId, dateLivrare, sumaReducere, codReducereAplicat } = req.body;

        const line_items = produse.map(item => {
            return {
                price_data: {
                    currency: 'ron',
                    product_data: {
                        name: item.titlu,
                    },
                    unit_amount: Math.round(item.pret * 100),
                },
                quantity: item.cantitate,
            };
        });

        const totalProduse = produse.reduce((acc, item) => acc + (item.pret * item.cantitate), 0);
        const costTransport = Math.round((totalFinal * 100) - (totalProduse * 100)) / 100;

        if (costTransport > 0) {
            line_items.push({
                price_data: {
                    currency: 'ron',
                    product_data: {
                        name: 'Cost Transport',
                    },
                    unit_amount: Math.round(costTransport * 100),
                },
                quantity: 1,
            });
        }

        // 1. CREEAZĂ COMANDA ÎN AȘTEPTARE AICI (EVITĂM LIMITA STRIPE DE 500 CARACTERE)
        const nouaComanda = new Comanda({
            utilizator: userId,
            dateLivrare,
            produse: produse.map(p => ({
                carteId: p.carteId,
                titlu: p.titlu,
                cantitate: p.cantitate,
                pret: p.pret
            })),
            total: totalFinal,
            sumaReducere: sumaReducere || 0,
            codReducereAplicat: codReducereAplicat || null,
            metodaPlata: 'card',
            stare: 'Plată în așteptare'
        });

        await nouaComanda.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            metadata: {
                comandaId: nouaComanda._id.toString()
            },
            success_url: `http://localhost:5173/success`,
            cancel_url: `http://localhost:5173/`,
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
         console.error("Eroare la crearea sesiunii Stripe:", error);
         res.status(500).json({ error: error.message });
    }
});

module.exports = router;
