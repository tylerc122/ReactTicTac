/// Defines how all files interact with one another.

import React, { useState } from "react";
import Login from "./Login";
import Game from "./Game";
import Navbar from "./Navbar";
import { useAuth } from "./AuthContext";
import "./styles.css";
import Statistics from "./Statistics";
import { Button } from "@mui/material";

function App() {
  const { user } = useAuth();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineGameType, setOfflineGameType] = useState(null); // For now, just local and bot play, online comes much later sounds hard to do

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    setOfflineGameType(null);
  };

  const selectOfflineGameType = (type) => {
    setOfflineGameType(type);
  };

  return (
    <div className="App">
      <Navbar />
      <div style={{ marginTop: "80px" }}></div>
      <Button onClick={toggleOfflineMode}>
        {isOfflineMode ? "Switch to Online Mode" : "Switch to Offline Mode"}
      </Button>
      {user && !isOfflineMode && <Statistics />}
      {isOfflineMode ? (
        <>
          {!offlineGameType && (
            <div>
              <Button
                variant="contained"
                onClick={() => selectOfflineGameType("local")}
              >
                Play with a Friend
              </Button>
              <Button
                variant="contained"
                sx={{ ml: "1%" }}
                onClick={() => selectOfflineGameType("bot")}
              >
                Play Against Bot
              </Button>
            </div>
          )}
          {offlineGameType && (
            <Game isOfflineMode={true} offlineGameType={offlineGameType} />
          )}
        </>
      ) : user ? (
        <Game isOfflineMode={false} offlineGameType={null} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
