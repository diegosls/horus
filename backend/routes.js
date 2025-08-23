const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_qualquer';

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
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await db.incident.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar incidentes' });
    }
});

// --- Registrar Incidente ---
router.post('/incidents', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

    const token = authHeader.split(' ')[0] || authHeader; // só pega o token
    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'Token inválido' });
    }

    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Dados incompletos' });

    try {
        const incident = await db.incident.create({
            data: {
                title,
                description,
                userId: payload.userId
            }
        });
        res.json(incident);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar incidente' });
    }
});

module.exports = router;
