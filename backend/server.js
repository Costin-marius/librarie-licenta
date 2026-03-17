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

// Middleware (procesam datele primite de la React și evitam erorile de tip CORS)
app.use(cors());
app.use(express.json()); // citeste date în format JSON

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/carti', cartiRoutes);
app.use('/api/comenzi', require('./routes/comenzi'));
app.use('/api/user', require('./routes/user'));
app.use('/api/cos', cosRoutes);

// Conectarea la baza de date
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat cu succes la baza de date MongoDB!'))
  .catch((err) => console.error('Eroare la conectarea cu MongoDB:', err));

// O ruta simpla de test pentru a verifica dacă serverul răspunde
app.get('/', (req, res) => {
  res.send('Serverul librariei functioneaza perfect!');
});

// SCRIPT PENTRU ACTUALIZAREA COMENZILOR (Cron Job)
// Rulează din 2 în 2 minute
cron.schedule('*/2 * * * *', async () => {
    try {
        // Asta e ordinea firească prin care trece un colet
        const fluxStari = ['Plasată', 'În procesare', 'Expediată', 'Livrată'];

        // Luăm din baza de date doar comenzile care încă sunt pe drum (sau abia plasate)
        const comenziActive = await Comanda.find({ stare: { $ne: 'Livrată' } });

        if (comenziActive.length > 0) {
            console.log(`--- Verific stările pentru ${comenziActive.length} comenzi active ---`);
        }

        for (let comanda of comenziActive) {
            // Verificăm unde se află comanda acum pe traseu
            const pasCurent = fluxStari.indexOf(comanda.stare);
            
            // Dacă știm stadiul și nu a ajuns încă la final ('Livrată')
            if (pasCurent !== -1 && pasCurent < fluxStari.length - 1) {
                comanda.stare = fluxStari[pasCurent + 1]; // O mutăm la stadiul următor
                await comanda.save();
                console.log(`Comanda ${comanda._id} a trecut în starea: ${comanda.stare}`);
            }
        }
    } catch (eroare) {
        console.error('Eroare la actualizarea automată a comenzilor:', eroare);
    }
});

// Pornirea serverului
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe portul ${PORT}`);
});