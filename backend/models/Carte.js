const mongoose = require('mongoose');

const carteSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    titlu: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        required: true
    },
    editura: {
        type: String,
        required: true
    },
    pret: {
        type: Number,
        required: true
    },
    stoc: {
        type: Number,
        required: true,
        default: 0
    },
    categorie: 
    { type: String, 
    required: false },
    
    imagine_url: {
        type: String,
        default: 'https://via.placeholder.com/150'
    }
}, { timestamps: true });

// metode
// + verificaStoc(cantitate) : Boolean
carteSchema.methods.verificaStoc = function(cantitateCeruta) {
    return this.stoc >= cantitateCeruta;
};

// + scadeStoc(cantitate) : void
carteSchema.methods.scadeStoc = async function(cantitateVanduta) {
    if (this.verificaStoc(cantitateVanduta)) {
        this.stoc -= cantitateVanduta;
        await this.save();
    } else {
        throw new Error('Stoc insuficient pentru a finaliza comanda!');
    }
};

// + getPret() : double
carteSchema.methods.getPret = function() {
    return this.pret;
};

module.exports = mongoose.model('Carte', carteSchema);