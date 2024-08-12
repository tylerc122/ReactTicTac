import React, { useState } from 'react';
import Login from './Login';
import Game from './Game';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';
import './styles.css';

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
      {user ? <Game /> : <Login />}
    </div>
  );
}

export default App;
