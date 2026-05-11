import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emails.js';
import actionRoutes from './routes/actions.js';

// import streamRoutes from './routes/stream.js';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Security & Middleware
app.use(helmet({ 
  contentSecurityPolicy: false // Handled by meta tag in index.html
}));
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// 🟢 P-01-T06: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/stream', streamRoutes);


// Serve Frontend Static Files
app.use(express.static(join(__dirname, 'public')));

// Catch-all: Send index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Synapse v2.0 running
  🔗 Local: http://localhost:${PORT}
  🛠  Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

