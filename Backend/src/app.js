import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import consultantRoutes from './routes/consultantRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // In development, we can allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consultant', consultantRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Marketing Consultant API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

export default app;
