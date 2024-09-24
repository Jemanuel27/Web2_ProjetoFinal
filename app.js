// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB conectado...'))
    .catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Servir arquivos estáticos (HTML, CSS, JS) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Rotas
const userRoutes = require('./routes/UserRoutes'); // Caminho do arquivo UserRoutes.js
const placaRoutes = require('./routes/PlacaRoutes'); // Caminho do arquivo PlacaRoutes.js
const videoRoutes = require('./routes/videoRoutes');//Caminho do arquivo videoRoutes.js

// Adicionar as rotas
app.use('/', userRoutes); // Rotas para login e cadastro de usuários
app.use('/', placaRoutes); // Rotas para cadastro de placas e relatórios
app.use('/', videoRoutes);

// Servir a página de login como página inicial
//app.get('/', (req, res) => {
  //  res.sendFile(path.join(__dirname, 'public', 'Cadastro.html'));
//});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports=app;