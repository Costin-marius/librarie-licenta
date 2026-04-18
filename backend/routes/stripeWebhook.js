const express = require('express');
const router = express.Router();
// stripe are nevoie de cheia secreta pentru webhook event construct, 
// o initializam la apel pentru a avea siguranta ca dotenv e incarcat.
const stripe = require('stripe');

const Comanda = require('../models/Comanda');
const Carte = require('../models/Carte');
const User = require('../models/User');
const Cos = require('../models/Cos');
const { trimiteEmail } = require('../services/emailService');

// Ruta foloseste express.raw({ type: 'application/json' }) la nivel de inregistrare in server.js
router.post('/', async (req, res) => {
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { comandaId } = session.metadata;

        try {
            // 1. Căutăm comanda pre-creată
            const comandaExistenta = await Comanda.findById(comandaId);
            
            if (comandaExistenta && comandaExistenta.stare === 'Plată în așteptare') {
                
                // Actualizăm statusul la Plasată
                comandaExistenta.stare = 'Plasată';
                await comandaExistenta.save();

                // 2. Scădem stocul
                for (let item of comandaExistenta.produse) {
                    await Carte.findByIdAndUpdate(item.carteId, {
                        $inc: { stoc: -item.cantitate } 
                    });
                }

                // 3. Golim coșul utilizatorului pe platformă
                await Cos.findOneAndDelete({ userId: comandaExistenta.utilizator });

                // 4. Trimitem email de confirmare
                const user = await User.findById(comandaExistenta.utilizator);
                if (user && user.email) {
                    const continut = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fcfcfc;">
                            <h2 style="color: #ea580c; text-align: center;">Plata ta a fost confirmată cu succes! 🎉</h2>
                            <p style="font-size: 16px; color: #333;">Salut, <strong>${user.nume}</strong>,</p>
                            <p style="font-size: 15px; color: #555;">Tranzacția pentru comanda ta a fost procesată cu succes pe platforma Stripe.</p>
                            
                            <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>📦 Număr Comandă:</strong> <span style="color: #2563eb;">${comandaExistenta._id}</span></p>
                                ${comandaExistenta.sumaReducere > 0 ? `<p style="margin: 5px 0; color: #ea580c;"><strong>🏷️ Reducere (${comandaExistenta.codReducereAplicat}):</strong> -${comandaExistenta.sumaReducere} RON</p>` : ''}
                                <p style="margin: 5px 0;"><strong>💳 Total achitat:</strong> <span style="font-weight: bold; color: #16a34a;">${comandaExistenta.total} RON</span></p>
                            </div>
                            
                            <p style="font-size: 15px; color: #555;">Pregătim coletul tău. Te vom anunța imediat ce este predat curierului!</p>
                            <br/>
                            <p style="font-size: 14px; color: #777;">Echipa BookIo</p>
                        </div>
                    `;
                    await trimiteEmail(user.email, 'Plată confirmată - BookIo', continut);
                }
            }
        } catch (error) {
            console.error("Eroare la procesarea comenzii din webhook:", error);
        }
    }

    res.json({ received: true });
});

module.exports = router;
