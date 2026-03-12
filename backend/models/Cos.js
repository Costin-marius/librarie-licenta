const mongoose = require('mongoose');

const cosSchema = new mongoose.Schema({
   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Aici pui numele exact pe care îl are modelul tău de User
        required: true,
        unique: true 
    },
    
    produse: [
        {
            carteId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Carte', // Aici pui numele exact pe care îl are modelul tău de Cărți
                required: true
            },
            cantitate: {
                type: Number,
                required: true,
                default: 1,
                min: 1 // Nu putem avea zero sau cantități negative
            }
        }
    ]
}, { timestamps: true }); 

module.exports = mongoose.model('Cos', cosSchema);