import React from 'react';
import Login from './Login';
import Game from './Game';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar />
      {user ? <Game /> : <Login />}
    </div>
  );
}

export default App;
