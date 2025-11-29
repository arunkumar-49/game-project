// routes/scores.js
import express from 'express';
import Score from '../models/Score.js';

const router = express.Router();

// GET /api/scores - Get top 10 scores
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/scores - Submit a new score
router.post('/', async (req, res) => {
  const { username, score } = req.body;
  
  if (!username || score == null) {
    return res.status(400).json({ message: 'Username and score are required' });
  }

  const newScore = new Score({
    username,
    score,
  });

  try {
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;