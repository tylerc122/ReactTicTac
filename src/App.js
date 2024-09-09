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

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
  }

  return (
    <div className="App">
      <Navbar />
      <div style={{ marginTop: '10px' }}></div>
      <button onClick={toggleOfflineMode}>
        {isOfflineMode ? 'Switch to Online Mode' : 'Switch to Offline Mode'}
      </button>
      {user && <Statistics />}
      {user || isOfflineMode ? <Game isOfflineMode={isOfflineMode} /> : <Login />}
    </div>
  );
}

export default App;
