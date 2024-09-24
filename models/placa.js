const mongoose = require('mongoose');

const placaSchema = new mongoose.Schema({
    numeroPlaca: String,
    cidade: String,
    dataHora: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Placa', placaSchema);
