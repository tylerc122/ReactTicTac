/// Defines how all files interact with one another.

import React, { useState } from 'react';
import Login from './Login';
import Game from './Game';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';
import './styles.css';
import Statistics from './Statistics';

function App() {
  const { user } = useAuth();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineGameType, setOfflineGameType] = useState(null); // For now, just local and bot play, online comes much later sounds hard to do

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    setOfflineGameType(null);
  }

  const selectOfflineGameType = (type) => {
    setOfflineGameType(type);
  }
  return (
    <div className="App">
      <Navbar />
      <div style={{ marginTop: '10px' }}></div>
      <button onClick={toggleOfflineMode}>
        {isOfflineMode ? 'Switch to Online Mode' : 'Switch to Offline Mode'}
      </button>
      {user && <Statistics />}
      {isOfflineMode ? (
        <>
          {!offlineGameType && (
            <div>
              <button onClick={() => selectOfflineGameType('local')}>Play with a Friend</button>
              <button onClick={() => selectOfflineGameType('bot')}>Play Against Bot</button>
            </div>
          )}
          {offlineGameType && <Game isOfflineMode={true} gameType={offlineGameType} />}
        </>
      ) : (
        user ? <Game isOfflineMode={false} /> : <Login />
      )}
    </div>
  );
}

export default App;
