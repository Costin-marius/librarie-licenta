const mongoose = require('mongoose');

const ComandaSchema = new mongoose.Schema({
    utilizator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    dateLivrare: {
        nume: { type: String, required: true },
        adresa: { type: String, required: true },
        telefon: { type: String, required: true }
    },
    produse: [{
        carteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carte' }, 
        titlu: String,
        cantitate: Number,
        pret: Number
    }],
    total: { type: Number, required: true },
    metodaPlata: { type: String, required: true },
    
    stare: { 
        type: String, 
        enum: ['Plasată', 'În procesare', 'Expediată', 'Livrată', 'Anulată'], // Doar aceste valori sunt acceptate
        default: 'Plasată' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Comanda', ComandaSchema);