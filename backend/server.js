const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cartiRoutes = require('./routes/carti');
const cosRoutes = require('./routes/cos');
const cron = require('node-cron');
const Comanda = require('./models/Comanda');

// Inițializam aplicația Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/carti', cartiRoutes);
app.use('/api/comenzi', require('./routes/comenzi'));
app.use('/api/user', require('./routes/user'));
app.use('/api/cos', cosRoutes);
app.use('/api/chat', require('./routes/chat'));

// Conectarea la baza de date
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat cu succes la baza de date MongoDB!'))
  .catch((err) => console.error('Eroare la conectarea cu MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Serverul librariei functioneaza perfect!');
});

// SCRIPT PENTRU ACTUALIZAREA COMENZILOR (Cron Job)
// Rulează din 2 în 2 minute
cron.schedule('*/2 * * * *', async () => {
    try {
        console.log(`[Cron] Actualizare în masă a stării comenzilor...`);

        // Update în ordine inversă pentru a nu decala stările în aceeași iterație!
        // 1. Din 'Expediată' în 'Livrată'
        const rezultatLivrare = await Comanda.updateMany(
            { stare: 'Expediată' },
            { $set: { stare: 'Livrată' } }
        );
        if (rezultatLivrare.modifiedCount > 0) console.log(`[Cron] ${rezultatLivrare.modifiedCount} comenzi au fost marcate ca Livrate.`);

        // 2. Din 'În procesare' în 'Expediată'
        const rezultatExpediere = await Comanda.updateMany(
            { stare: 'În procesare' },
            { $set: { stare: 'Expediată' } }
        );
        if (rezultatExpediere.modifiedCount > 0) console.log(`[Cron] ${rezultatExpediere.modifiedCount} comenzi au fost marcate ca Expediate.`);

        // 3. Din 'Plasată' în 'În procesare'
        const rezultatProcesare = await Comanda.updateMany(
            { stare: 'Plasată' },
            { $set: { stare: 'În procesare' } }
        );
        if (rezultatProcesare.modifiedCount > 0) console.log(`[Cron] ${rezultatProcesare.modifiedCount} comenzi au intrat În procesare.`);

    } catch (eroare) {
        console.error('[Cron] Eroare la actualizarea rapidă a comenzilor:', eroare);
    }
});

// Pornirea serverului
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe portul ${PORT}`);
});