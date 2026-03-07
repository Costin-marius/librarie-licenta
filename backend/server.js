const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cartiRoutes = require('./routes/carti');
// Inițializam aplicația Express
const app = express();


// Middleware (procesam datele primite de la React și evitam erorile de tip CORS)
app.use(cors());
app.use(express.json()); //citeste date în format JSON

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/carti', cartiRoutes);

// Conectarea la baza de date
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat cu succes la baza de date MongoDB!'))
  .catch((err) => console.error('Eroare la conectarea cu MongoDB:', err));

// O ruta simpla de test pentru a verifica dacă serverul răspunde
app.get('/', (req, res) => {
  res.send('Serverul librariei functioneaza perfect!');
});

// Pornirea serverului
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe portul ${PORT}`);
});