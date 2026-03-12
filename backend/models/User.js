const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    parola: { type: String, required: true },
    rol: { type: String, default: 'client' },
    adresa: { type: String, default: '' },
    
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Carte' }],

    cos: [{
        carte: { type: mongoose.Schema.Types.ObjectId, ref: 'Carte' },
        cantitate: { type: Number, default: 1 } 
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);