const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { produse, totalFinal, userId, dateLivrare } = req.body;

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

        // Adăugăm transportul ca un item separat dacă există
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

        // Compactăm produsele pentru metadata (max 500 caractere)
        const produseCompacte = produse.map(p => ({
            id: p.carteId,
            q: p.cantitate,
            p: p.pret,
            t: p.titlu.substring(0, 20) // Trimitem si titlul scurtat pentru email
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            metadata: {
                userId: userId,
                dateLivrare: JSON.stringify(dateLivrare),
                produse: JSON.stringify(produseCompacte)
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
