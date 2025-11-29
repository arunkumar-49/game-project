import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    maxLength: 15
  },
  score: {
    type: Number,
    required: true,
  }
}, { timestamps: true }); // `timestamps` adds `createdAt` and `updatedAt`

const Score = mongoose.model('Score', scoreSchema);

export default Score;