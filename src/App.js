/// Defines how all files interact with one another.

import React, { useState, useEffect } from "react";
import Login from "./Login";
import Game from "./Game";
import Navbar from "./Navbar";
import { useAuth } from "./AuthContext";
import "./styles.css";
import Statistics from "./Statistics";
import { Button } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./About";

function App() {
  const { user } = useAuth();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineGameType, setOfflineGameType] = useState(null); // For now, just local and bot play, online comes much later sounds hard to do
  const [gameActive, setGameActive] = useState(false);
  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    setOfflineGameType(null);
  };

  useEffect(() => {
    // Set game active if:
    // 1. In offline mode with a game type selected, or
    // 2. In online mode and matched with opponent
    setGameActive(
      (isOfflineMode && offlineGameType) ||
        (!isOfflineMode && user && user.opponent)
    );
  }, [isOfflineMode, offlineGameType, user, user?.opponent]);

  const selectOfflineGameType = (type) => {
    setOfflineGameType(type);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isGameActive={gameActive} />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route
            path="/"
            element={
              <>
                <div style={{ marginTop: "80px" }}></div>
                <Button onClick={toggleOfflineMode}>
                  {isOfflineMode
                    ? "Switch to Online Mode"
                    : "Switch to Offline Mode"}
                </Button>
                {user && <Statistics />}
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
                      <Game
                        isOfflineMode={true}
                        offlineGameType={offlineGameType}
                        setGameActive={setGameActive}
                      />
                    )}
                  </>
                ) : user ? (
                  <Game
                    isOfflineMode={false}
                    offlineGameType={null}
                    setGameActive={setGameActive}
                  />
                ) : (
                  <Login />
                )}
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
