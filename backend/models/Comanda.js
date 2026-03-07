const mongoose = require('mongoose');

const ComandaSchema = new mongoose.Schema({
    dateLivrare: {
        nume: { type: String, required: true },
        adresa: { type: String, required: true },
        telefon: { type: String, required: true }
    },
    produse: [{
        carteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carte' }, // Legătura cu cartea reală
        titlu: String,
        cantitate: Number,
        pret: Number
    }],
    total: { type: Number, required: true },
    metodaPlata: { type: String, required: true },
    stare: { type: String, default: 'În procesare' } // Statusul comenzii
}, { timestamps: true }); // Asta va adăuga automat data și ora când s-a făcut comanda

module.exports = mongoose.model('Comanda', ComandaSchema);