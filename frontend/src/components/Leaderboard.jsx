import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this matches your backend port
const API_URL = 'http://localhost:5001/api/scores'; 

function Leaderboard({ finalScore, onRestart }) {
  const [username, setUsername] = useState('');
  const [scores, setScores] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await axios.get(API_URL);
      setScores(res.data);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await axios.post(API_URL, { username, score: finalScore });
      setSubmitted(true);
      fetchScores();
    } catch (err) {
      console.error('Error submitting score:', err);
    }
  };

  return (
    <div className="glass-panel leaderboard-container">
      <div className="leaderboard-header">
        <h2>GAME OVER</h2>
      </div>
      
      <div className="final-score-display">
        SCORE: <span>{finalScore}</span>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="lb-input-group">
            <input
              className="styled-input"
              type="text"
              placeholder="Enter Name for Record"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
            />
          </div>
          <div className="lb-input-group">
            <button type="submit" className="btn-primary">SUBMIT SCORE</button>
            <button type="button" className="btn-secondary" onClick={onRestart}>RETRY</button>
          </div>
        </form>
      ) : (
        <button className="btn-primary" onClick={onRestart} style={{ width: '100%', marginBottom: '20px' }}>
          PLAY AGAIN
        </button>
      )}

      <div className="leaderboard-list">
        <h3>TOP AGENTS</h3>
        {scores.length > 0 ? (
          scores.map((score, index) => (
            <div className="lb-item" key={score._id || index}>
              <div className="lb-rank">#{index + 1}</div>
              <div className="lb-name">{score.username}</div>
              <div className="lb-score">{score.score}</div>
            </div>
          ))
        ) : (
          <p style={{color: '#666', marginTop: '20px'}}>Loading data...</p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;