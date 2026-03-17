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
    
    // --- 1. RATINGUL TĂU ORIGINAL (Doar steluțe, 1-5) ---
    ratinguri: [
        {
            utilizator: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
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
    },

    // --- 2. NOU: PARTEA PENTRU DISCUȚII / COMENTARII TEXT ---
    comentarii: [
        {
            utilizator: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            numeUtilizator: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true
            },
            data: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

// --- metode ---

carteSchema.methods.verificaStoc = function(cantitateCeruta) {
    return this.stoc >= cantitateCeruta;
};

carteSchema.methods.scadeStoc = async function(cantitateVanduta) {
    if (this.verificaStoc(cantitateVanduta)) {
        this.stoc -= cantitateVanduta;
        await this.save();
    } else {
        throw new Error('Stoc insuficient pentru a finaliza comanda!');
    }
};

carteSchema.methods.getPret = function() {
    return this.pret;
};

// --- Metoda ta originală pentru calculul steluțelor ---
carteSchema.methods.calculeazaRating = async function() {
    if (this.ratinguri.length === 0) {
        this.ratingMediu = 0;
        this.numarRecenzii = 0;
    } else {
        const sumaNote = this.ratinguri.reduce((total, rating) => total + rating.nota, 0);
        this.ratingMediu = parseFloat((sumaNote / this.ratinguri.length).toFixed(1));
        this.numarRecenzii = this.ratinguri.length;
    }
    await this.save();
};

module.exports = mongoose.model('Carte', carteSchema);