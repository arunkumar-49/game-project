import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import scoreRoutes from './routes/scores.js';
import authRoutes from './routes/auth.js'; // <-- NEW

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from your React frontend

// --- NEW AUTH ROUTE ---
app.use('/api/auth', authRoutes);

// API Routes
app.use('/api/scores', scoreRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 5001; // Using 5001 as per your last setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} and connected to MongoDB`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
  });