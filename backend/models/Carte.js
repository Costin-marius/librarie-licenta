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
    categorie: { 
        type: String, 
        required: false 
    },
    imagine_url: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    descriere: {
        type: String,
        required: false, 
        default: "Descrierea nu este disponibilă momentan."
    },
    limba: {
        type: String,
        required: false,
        default: "Romana"
    },
    anPublicare: {
        type: Number,
        required: false
    },
    nrPagini: {
        type: Number,
        required: false
    },
    // --- NOU: Partea pentru Rating ---
    ratinguri: [
        {
            utilizator: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Face legătura cu utilizatorul care a lăsat recenzia
                required: true
            },
            nota: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            }
        }
    ],
    ratingMediu: {
        type: Number,
        default: 0
    },
    numarRecenzii: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// --- metode ---

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

// --- NOU: Metodă pentru a recalcula automat media notelor ---
carteSchema.methods.calculeazaRating = async function() {
    if (this.ratinguri.length === 0) {
        this.ratingMediu = 0;
        this.numarRecenzii = 0;
    } else {
        const sumaNote = this.ratinguri.reduce((total, recenzie) => total + recenzie.nota, 0);
        // Calculăm media și o rotunjim la o zecimală (ex: 4.5)
        this.ratingMediu = parseFloat((sumaNote / this.ratinguri.length).toFixed(1));
        this.numarRecenzii = this.ratinguri.length;
    }
    await this.save();
};

module.exports = mongoose.model('Carte', carteSchema);