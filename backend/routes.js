const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_qualquer';

// Middleware de autenticação para as rotas protegidas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Assume o formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro de verificação do token:', err);
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        req.user = user; // Adiciona o payload do token ao objeto de requisição
        next();
    });
};

// --- Registro de Usuário ---
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });

    const existingUser = await db.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Usuário já existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
        data: { username, password: hashedPassword }
    });

    return res.json({ id: user.id, username: user.username });
});

// --- Login ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await db.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
});

// --- Listar Incidentes ---
router.get('/incidents', authenticateToken, async (req, res) => {
    try {
        const incidents = await db.incident.findMany({ 
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar incidentes' });
    }
});

// --- Registrar Incidente ---
router.post('/incidents', authenticateToken, async (req, res) => {
    const { title, description, date, time, type } = req.body;
    console.log('POST /incidents chamado');
    console.log('Dados recebidos:', { title, description, date, time, type, userId: req.user.userId });

    if (!title || !description || !date || !time || !type) {
        return res.status(400).json({ error: 'Dados incompletos. Todos os campos são obrigatórios.' });
    }

    try {
        const incident = await db.incident.create({
            data: {
                title,
                description,
                date: new Date(date),
                time,
                type,
                user: {
                    connect: { id: req.user.userId }
                }
            }
        });
        res.json(incident);
    } catch (err) {
        console.error('Erro detalhado ao registrar incidente:', err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;