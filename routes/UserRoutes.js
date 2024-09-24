const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ajustar o caminho conforme necessário
const path = require('path'); // Importar o módulo path
const router = express.Router();

// Rota para servir login.html
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html')); // Ajustar o caminho para o login.html
});

// Rota para servir cadastro.html
router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'cadastro.html')); // Ajustar o caminho para o cadastro.html
});

// Rota para cadastro de usuário
router.post('/cadastro', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já está em uso.' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o novo usuário
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error('Erro no cadastro:', error.message);
        res.status(500).json({ message: 'Erro ao criar o usuário.' });
    }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou senha incorretos.' });
        }

        // Compara a senha fornecida com a senha criptografada no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou senha incorretos.' });
        }

        // Gera um token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Define o tempo de expiração do token
        });

        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ message: 'Erro no login.' });
    }
});

module.exports = router;
