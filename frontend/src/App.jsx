import React, { useState } from 'react';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import AuthForm from './auth/AuthForm';
import Navbar from './components/Navbar'; // Import the new Navbar
import { useAuth } from './auth/AuthContext';

function App() {
  const { user } = useAuth(); 
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score) => {
    setFinalScore(score);
    setIsGameOver(true);
  };

  const handleRestart = () => {
    setFinalScore(0);
    setIsGameOver(false);
  };

  return (
    <div className="App">
      <Navbar />
      
      <div className="main-content">
        {!user ? (
          <AuthForm />
        ) : (
          <>
            {!isGameOver ? (
              <Game onGameOver={handleGameOver} />
            ) : (
              <Leaderboard finalScore={finalScore} onRestart={handleRestart} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;