const express = require('express');
const multer = require('multer');
const fs = require('fs');
const FormData = require('@postman/form-data');
const axios = require('axios');
const Placa = require('../models/placa'); // Ajuste o caminho para o modelo
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken'); // Certifique-se de importar o jwt

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Middleware para autenticar o token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']; // Recebe o token do cabeçalho 'Authorization'

    if (!token) return res.status(401).json({ msg: 'Token não fornecido.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: 'Token inválido.' });
        req.user = user; // Armazena as informações do usuário na requisição
        next(); // Continua para a próxima função na rota
    });
}

// URL da API OCR.Space
const OCR_SPACE_DEFAULT_API = 'https://api.ocr.space/parse/image';

// Rota para upload de imagem e processamento OCR
router.post('/cadastroPlaca', authenticateToken, upload.single('image'), async (req, res) => { // Adiciona authenticateToken aqui
    const imagePath = req.file.path;
    const cidade = req.body.cidade;

    // Verifica se a chave da API está definida
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não definida' });
    }

    // Criando o FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('filetype', 'PNG'); // Define o tipo de arquivo

    // Configuração da requisição para a API OCR.Space
    const options = {
        method: 'POST',
        url: OCR_SPACE_DEFAULT_API,
        headers: {
            apikey: apiKey,
            ...formData.getHeaders()
        },
        data: formData
    };

    try {
        // Fazendo a requisição para a API OCR.Space
        const response = await axios.request(options);
        console.log(response.data);

        // Verifica se ParsedResults está presente e possui dados
        const parsedText = response.data.ParsedResults[0]?.ParsedText || '';

        // Ajusta a lógica para extrair o número da placa do texto reconhecido
        const placaMatch = parsedText.match(/(?:[A-Z]{2,3}-?\d{4,6})|(?:[A-Z0-9]{7,10})/i);
        const numeroPlaca = placaMatch ? placaMatch[0].replace(/[^A-Z0-9]/gi, '') : 'Número não encontrado';

        // Verifica se o número da placa é válido (opcional)
        if (numeroPlaca.length < 6 || numeroPlaca.length > 10) {
            return res.status(400).json({ error: 'Número da placa não válido' });
        }

        // Criar um novo documento no MongoDB
        const placa = new Placa({
            numeroPlaca: numeroPlaca,
            cidade: cidade
        });

        await placa.save();
        res.json({
            message: 'Informações salvas com sucesso!',
            placa
        });
    } catch (error) {
        console.error('Erro na requisição:', error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data || 'Erro ao processar a imagem' });
    } finally {
        fs.unlinkSync(imagePath); // Remove o arquivo temporário
    }
});

// Rota para gerar o PDF com os registros da cidade
router.get('/relatorio/cidade/:cidade', authenticateToken, async (req, res) => { // Adiciona authenticateToken aqui
    const cidade = req.params.cidade;

    try {
        // Consulta o MongoDB para obter os registros da cidade
        const placas = await Placa.find({ cidade: new RegExp(cidade, 'i') });

        if (placas.length === 0) {
            return res.status(404).json({ message: 'Nenhum registro encontrado para a cidade fornecida.' });
        }

        // Cria um novo documento PDF
        const doc = new PDFDocument();

        // Define o cabeçalho do PDF
        doc.fontSize(16).text(`Relatório para a cidade: ${cidade}`, { align: 'center' });
        doc.moveDown();

        // Adiciona os registros no PDF
        placas.forEach(placa => {
            doc.fontSize(12).text(`Número da Placa: ${placa.numeroPlaca}`);
            doc.text(`Data e Hora: ${placa.dataHora}`);
            doc.moveDown();
        });

        // Envia o PDF como resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_cidade.pdf');

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error.message);
        res.status(500).json({ message: 'Erro ao gerar o PDF.' });
    }
});

// Rota para consulta de placa
router.get('/consulta/:placa', authenticateToken, async (req, res) => { // Adiciona authenticateToken aqui
    const placaNumber = req.params.placa.toUpperCase(); // Converte o número da placa para maiúsculas para evitar problemas com case sensitivity

    try {
        // Consulta o MongoDB para verificar se a placa existe
        const placa = await Placa.findOne({ numeroPlaca: placaNumber });

        if (placa) {
            return res.json({
                message: 'Placa encontrada!',
                placa
            });
        } else {
            return res.status(404).json({ message: 'Placa não encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao consultar a placa:', error.message);
        res.status(500).json({ message: 'Erro ao consultar a placa.' });
    }
});

module.exports = router;
