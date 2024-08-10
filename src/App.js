import React from 'react';
import Login from './Login';
import Game from './Game';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';
import './styles.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar />
      <div style={{ marginTop: '10px' }}></div>
      {user ? <Game /> : <Login />}
    </div>
  );
}

export default App;
