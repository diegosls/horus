const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

app.use(cors());
app.use(express.json());

// --- Registro de usuário ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Campos obrigatórios.');

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).send('Usuário já existe.');

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, password: hashedPassword } });
    res.status(201).json({ message: 'Usuário criado com sucesso' });
});

// --- Login ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).send('Usuário ou senha inválidos.');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).send('Usuário ou senha inválidos.');

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
});

// --- Middleware de autenticação ---
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Token não fornecido.');

    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).send('Token inválido.');
    }
}

// --- Incidentes ---
app.get('/api/incidents', authMiddleware, async (req, res) => {
    const incidents = await prisma.incident.findMany({ 
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(incidents);
});

app.post('/api/incidents', authMiddleware, async (req, res) => {
    const { title, description, date, time, type } = req.body;
    
    if (!title || !description || !date || !time || !type) {
        return res.status(400).send('Campos obrigatórios: título, descrição, data, hora e tipo.');
    }

    try {
        const incident = await prisma.incident.create({
            data: { 
                title, 
                description, 
                date: new Date(date),
                time,
                type,
                userId: req.userId 
            }
        });
        res.status(201).json(incident);
    } catch (err) {
        console.error("Erro ao registrar incidente:", err);
        res.status(500).send('Erro interno do servidor ao registrar incidente.');
    }
});

app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));