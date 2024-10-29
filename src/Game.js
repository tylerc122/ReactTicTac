/// Defines game logic.

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { getGameState, updateGameState, updateStats } from "./api";
import { useAuth } from "./AuthContext";
import { MakeBot } from "./bots/MakeBot";
import io from "socket.io-client";
import {
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const SOCKET_URL =
  typeof import.meta.env !== "undefined"
    ? import.meta.env.VITE_API_URL || "https://api.tictactyler.com"
    : "https://api.tictactyler.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  secure: true,
  rejectUnauthorized: false,
  path: "/socket.io",
  withCredentials: true,
});

const ModeSelectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

const ModeButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 3),
}));

const CoinFlipOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
}));

const BoardWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(7), // Add space above the board
}));

const GameInfoBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0),
  padding: theme.spacing(1),
  marginBottom: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  textAlign: "center",
}));

function calculateWinner(squares) {
  if (!Array.isArray(squares)) {
    console.error("Invalid squares:", squares);
    return null;
  }
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
  onReset,
  showOverlay,
  toggleOverlay,
  returnToWinScreen,
  showCoinFlip,
  isBotTurn,
  isProcessingTurn,
  opponentDisconnected,
  handleFindMatch,
  isOnlineMode,
}) {
  function handleClick(i) {
    if (
      showCoinFlip ||
      isBotTurn ||
      isProcessingTurn ||
      squares[i] ||
      calculateWinner(squares)
    ) {
      return;
    }
    onPlay(i);
  }

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);
  let status;

  if (opponentDisconnected) {
    status = "Opponent Disconnected, you freakin win.";
  } else if (winner) {
    status = "Winner: " + winner + "!";
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="board-container">
        <div
          className={`board ${
            winner || isDraw || opponentDisconnected
              ? showOverlay
                ? "blur"
                : ""
              : ""
          }`}
        >
          <div className="status">{status}</div>
          <div className="board-row">
            <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
            <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
            <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
          </div>
          <div className="board-row">
            <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
            <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
            <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
          </div>
          <div className="board-row">
            <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
            <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
            <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
          </div>
        </div>
        {(winner || isDraw || opponentDisconnected) && showOverlay && (
          <div className="winner-overlay">
            <div>{status}</div>
            {isOnlineMode ? (
              <button className="requeue-button" onClick={handleFindMatch}>
                QUEUE TF UP
              </button>
            ) : (
              <button className="replay-button" onClick={onReset}>
                Replay?
              </button>
            )}
            <button className="toggle-blur-button" onClick={toggleOverlay}>
              Toggle Blur
            </button>
          </div>
        )}

        {(winner || isDraw || opponentDisconnected) && !showOverlay && (
          <button
            className="return-win-screen-button"
            onClick={returnToWinScreen}
          >
            Return To Win Screen
          </button>
        )}
      </div>
    </>
  );
}

function launchConfetti() {
  confetti({
    particleCount: 1000,
    startVelocity: 90,
    spread: 360,
    origin: {
      x: 0.5,
      y: 1,
    },
    ticks: 90,
  });
}

export default function Game({ isOfflineMode, offlineGameType }) {
  // Game logic stuff
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [confettiLaunched, setConfettiLaunched] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [currentSquares, setCurrentSquares] = useState(Array(9).fill(null));
  const [gameInitialized, setGameInitialized] = useState(false);

  // Online stuff
  const { user, updateUser } = useAuth();
  const [isOnlineMode, setIsOnlineMode] = useState(!isOfflineMode);
  const [gameId, setGameId] = useState(null);
  const [opponent, setOpponent] = useState({ id: null, username: null });
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  // Offline stuff
  const [botDifficulty, setBotDifficulty] = useState(null);
  const [bot, setBot] = useState(null);
  const [botSymbol, setBotSymbol] = useState("O");
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [botInitialized, setBotInitialized] = useState(false);
  const [difficultySelected, setDifficultySelected] = useState(false);
  const [playerStarts, setPlayerStarts] = useState(true);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [shouldCoinFlip, setShouldCoinFlip] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  // Hook that handles when an online match found
  useEffect(() => {
    if (isOnlineMode) {
      // Sending info to server when a user connects
      if (user) {
        socket.emit("userConnected", { userId: user.id });
      }
      // Set up listener for matchFound socket connection, we wait for an emitter to emit matchFound,
      // we then update variables accordingly.
      socket.on("matchFound", ({ gameId, opponent, start, symbol }) => {
        setGameId(gameId);
        setOpponent(opponent); // This now recieves {id, username}
        setIsWaiting(false);
        setPlayerSymbol(symbol);
        setIsMyTurn(start);
        setGameInitialized(true);
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setXIsNext(true);
        setCurrentSquares(Array(9).fill(null));
        console.log(
          `Match found. You are ${symbol}. ${
            start ? "Your turn" : "Opponent's turn"
          }`
        );
      });

      // Listener for the opponentMove
      socket.on("opponentMove", ({ position, player }) => {
        setCurrentSquares((prevSquares) => {
          // Create new arr & update accordingly based on player symbol & pos
          const nextSquares = [...prevSquares];
          nextSquares[position] = player === "X" ? "X" : "O";
          return nextSquares;
        });
        setXIsNext((prevXIsNext) => !prevXIsNext);
        console.log(`Opponent moved: ${player} at position ${position}`);
      });

      // Listener for turnChange
      socket.on("turnChange", ({ isYourTurn }) => {
        setIsMyTurn(isYourTurn);
        console.log(`Turn changed. Is it your turn? ${isYourTurn}`);
      });

      // Listener for opponent disconnecting
      socket.on("opponentDisconnected", () => {
        console.log("Opponent disconnected");
        // Handle opponent disconnection (e.g., end game, show message)
        setGameEnded(true);
        setShowOverlay(true);
        setOpponentDisconnected(true);
        setCurrentSquares((prevSquares) => {
          const winner = calculateWinner(prevSquares);
          if (!winner) {
            handleGameEnd(playerSymbol);
          }
          return prevSquares;
        });
        // Should probably display a diff message for a disconnection
      });

      return () => {
        socket.off("matchFound");
        socket.off("opponentMove");
        socket.off("turnChange");
        socket.off("opponentDisconnected");
      };
    }
  }, [isOnlineMode, user]);

  useEffect(() => {
    setIsOnlineMode(!isOfflineMode);
  }, [isOfflineMode]);

  useEffect(() => {
    const winner = calculateWinner(currentSquares);
    if (winner && !confettiLaunched) {
      launchConfetti(); // CONFETTI!!!!!
      setConfettiLaunched(true);
    }
  }, [currentSquares, confettiLaunched]);

  useEffect(() => {
    if (!isOfflineMode) {
      fetchGameState();
    } else {
      setGameInitialized(false);
    }
    setDifficultySelected(false);
  }, [isOfflineMode, offlineGameType]);

  useEffect(() => {
    if (offlineGameType === "bot" && botDifficulty) {
      const newBot = MakeBot.createBot(botDifficulty);
      setBot(newBot);
      setBotInitialized(true);
      setGameInitialized(false);
    }
  }, [offlineGameType, botDifficulty]);

  useEffect(() => {
    if (!gameInitialized && !gameEnded) {
      resetGame();
    }
  }, [gameInitialized, gameEnded]);

  useEffect(() => {
    const isBotMode = isOfflineMode && offlineGameType === "bot";
    const isBotMove = isBotMode && isBotTurn;

    if (
      isBotMove &&
      !calculateWinner(currentSquares) &&
      gameInitialized &&
      !showCoinFlip &&
      currentSquares.some((square) => square === null) &&
      botInitialized
    ) {
      setIsProcessingTurn(true);
      const timer = setTimeout(() => {
        const botMove = bot.makeMove(currentSquares);
        const nextSquares = currentSquares.slice();
        const moveIndex = botMove.findIndex(
          (square, index) => square !== currentSquares[index]
        );
        if (moveIndex !== -1) {
          nextSquares[moveIndex] = botSymbol;
          handlePlay(nextSquares, false);
        } else {
          console.error("Bot did not make a valid move");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    currentSquares,
    isBotTurn,
    isOfflineMode,
    offlineGameType,
    bot,
    gameInitialized,
    showCoinFlip,
    botSymbol,
    botInitialized,
  ]);

  useEffect(() => {
    console.log("Game state:", {
      showCoinFlip,
      playerStarts,
      playerSymbol,
      botSymbol,
    });
  }, [showCoinFlip, playerStarts, playerSymbol, botSymbol]);

  useEffect(() => {
    if (isOfflineMode && offlineGameType === "bot" && bot) {
      bot.setSymbol(botSymbol);
    }
  }, [botSymbol, isOfflineMode, offlineGameType, bot, botInitialized]);

  useEffect(() => {
    console.log("Current squares:", currentSquares);
  }, [currentSquares]);

  function handleFindMatch() {
    if (user) {
      socket.emit("findMatch", user.id);
      setIsWaiting(true);
      resetGameState();
    }
  }

  function resetGameState() {
    setGameId(null);
    setOpponent(null);
    setPlayerSymbol(null);
    setIsMyTurn(false);
    setCurrentSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameEnded(false);
    setShowOverlay(false);
    setOpponentDisconnected(false);
  }

  function handleCancelMatch() {
    socket.emit("cancelMatch", user.id);
    setIsWaiting(false);
  }

  function coinFlip() {
    if (isOfflineMode && offlineGameType === "bot") {
      if (showCoinFlip) return;
      setTimeout(() => {
        const result = Math.random() < 0.5;
        setPlayerStarts(result);
        setXIsNext(true); // X always starts
        setPlayerSymbol(result ? "X" : "O");
        setBotSymbol(result ? "O" : "X");
        setIsBotTurn(!result);
        setShowCoinFlip(false);
        setGameInitialized(true);
        setIsProcessingTurn(false);
      }, 1700);
    } else {
      setXIsNext(true);
      setGameInitialized(true);
      setIsProcessingTurn(false);
    }
  }

  function handleBotDifficulty(difficulty) {
    setBotDifficulty(difficulty);
    setDifficultySelected(true);
    resetGame();
  }

  function resetDifficultySelection() {
    setDifficultySelected(false);
    setBotDifficulty(null);
    setBot(null);
    setBotInitialized(false);
    setGameInitialized(false);
  }

  async function fetchGameState() {
    try {
      const gameState = await getGameState();
      if (Array.isArray(gameState) && gameState.length === 9) {
        setHistory([gameState]);
        setCurrentMove(gameState.filter((square) => square !== null).length);
        // Based on where we are in the game, assign these vars.
        setXIsNext(
          gameState.filter((square) => square !== null).length % 2 === 0
        );
        setGameEnded(
          calculateWinner(gameState) !== null ||
            gameState.every((square) => square !== null)
        );
        setCurrentSquares(gameState);
      } else {
        console.error("Invalid game state:", gameState);
        resetGame();
      }
    } catch (error) {
      console.error("Failed to fetch current game state", error);
      resetGame();
    }
  }

  async function handlePlay(nextSquares, isPlayerMove = true) {
    if (gameEnded || !gameInitialized) {
      return;
    }

    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setCurrentSquares(nextSquares);

    const newWinner = calculateWinner(nextSquares);
    const newIsDraw =
      !newWinner && nextSquares.every((square) => square !== null);

    if (newWinner || newIsDraw) {
      setGameEnded(true);
      setShowOverlay(true);
      handleGameEnd(newWinner || "draw");
    } else {
      setXIsNext(!xIsNext);
      if (isOnlineMode) {
        setIsMyTurn(false);
      } else if (offlineGameType === "bot") {
        setIsBotTurn(isPlayerMove);
      }
    }

    setIsProcessingTurn(false);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setCurrentSquares(history[nextMove]);
    setXIsNext(nextMove % 2 === 0);
  }

  async function handleGameEnd(result) {
    if (result === "X") {
      setXScore(xScore + 1);
    } else if (result === "O") {
      setOScore(oScore + 1);
    } else {
      setDraws(draws + 1);
    }

    if (!isOfflineMode && user) {
      try {
        let statResult;
        // Determine the result based on player's symbol and game outcome
        if (opponentDisconnected) {
          statResult = "win"; // Auto-win if opponent disconnects
        } else if (result === "draw") {
          statResult = "draw";
        } else {
          // Compare player's symbol with the winning symbol
          statResult = result === playerSymbol ? "win" : "loss";
        }

        console.log("Updating stats with result:", statResult);

        const updatedStats = await updateStats(statResult);

        console.log("Received updated stats:", updatedStats);

        if (updatedStats) {
          updateUser({
            ...user,
            stats: updatedStats,
          });
        }

        // Reset game state
        await updateGameState(Array(9).fill(null));
      } catch (error) {
        console.error("Failed to update stats:", error);
      }
    }

    setGameInitialized(false);
  }

  function handleSquareClick(i) {
    // Online mode
    if (isOnlineMode) {
      if (!isMyTurn || currentSquares[i] || calculateWinner(currentSquares))
        return;
      const nextSquares = [...currentSquares];
      nextSquares[i] = playerSymbol;
      setCurrentSquares(nextSquares);
      setXIsNext(!xIsNext);
      socket.emit("move", { gameId, position: i, player: user.id });
      setIsMyTurn(false); // Immediately set to false after making a move
      console.log(`You moved: ${playerSymbol} at position ${i}`);

      // Bot mode
    } else if (offlineGameType === "bot") {
      if (
        showCoinFlip ||
        isBotTurn ||
        isProcessingTurn ||
        currentSquares[i] ||
        calculateWinner(currentSquares)
      ) {
        return;
      }
      const nextSquares = currentSquares.slice();
      nextSquares[i] = playerSymbol;
      handlePlay(nextSquares, true);

      // Couch play
    } else {
      if (currentSquares[i] || calculateWinner(currentSquares)) return;
      const nextSquares = currentSquares.slice();
      nextSquares[i] = xIsNext ? "X" : "O";
      handlePlay(nextSquares);
    }
  }

  function resetGame() {
    if (showCoinFlip) return; // Prevents multiple resets

    setShowCoinFlip(true);
    setIsProcessingTurn(true);
    setGameInitialized(false);
    setGameEnded(false);
    setShowOverlay(false);
    setOpponentDisconnected(false);

    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setConfettiLaunched(false);
    setCurrentSquares(Array(9).fill(null));

    if (!isOfflineMode) {
      updateGameState(Array(9).fill(null)).catch((error) => {
        console.error("Failed to reset game state", error);
      });
    }

    if (isOfflineMode && offlineGameType === "bot") {
      setShowCoinFlip(true);
    } else {
      setShowCoinFlip(false);
    }
    // Trigger coin flip immediately
    coinFlip();
  }

  useEffect(() => {
    if (shouldCoinFlip) {
      coinFlip();
      setShouldCoinFlip(false);
    }
  }, [shouldCoinFlip]);

  function toggleOverlay() {
    setShowOverlay(!showOverlay);
  }

  function returnToWinScreen() {
    setShowOverlay(true);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game-container">
      {isOnlineMode ? (
        <>
          <div className="scoreboard"></div>
          {!gameId && !isWaiting && (
            <button onClick={handleFindMatch}>Find Online Match</button>
          )}
          {isWaiting && (
            <>
              <p>Waiting for an opponent...</p>
              <button onClick={handleCancelMatch}>Cancel</button>
            </>
          )}
          {gameId && (
            <div className="online-match-stats">
              <p>Playing against: {opponent.username || "Unknown Player"}</p>
              <p>You are: {playerSymbol || "Waiting for symbol..."}</p>
              <p>{isMyTurn ? "Your turn" : "Opponent's turn"}</p>
            </div>
          )}
          <div className="game">
            <div className="game-board">
              <Board
                xIsNext={xIsNext}
                squares={currentSquares}
                onPlay={handleSquareClick}
                onReset={resetGame}
                showOverlay={showOverlay}
                toggleOverlay={toggleOverlay}
                returnToWinScreen={returnToWinScreen}
                confettiLaunched={confettiLaunched}
                setConfettiLaunched={setConfettiLaunched}
                gameEnded={gameEnded}
                isBotTurn={false}
                isProcessingTurn={!isMyTurn || !gameId}
                showCoinFlip={false}
                opponentDisconnected={opponentDisconnected}
                handleFindMatch={handleFindMatch}
                isOnlineMode={isOnlineMode}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {isOfflineMode && offlineGameType === "bot" && !difficultySelected ? (
            <ModeSelectionPaper sx={{}} elevation={3}>
              <Typography variant="h5" gutterBottom>
                Select Bot Difficulty
              </Typography>
              <Stack container spacing={2} justifyContent="center">
                <Stack sx={{ alignItems: "center" }} item>
                  <ModeButton
                    sx={{ backgroundColor: "green", minWidth: "50%" }}
                    variant="contained"
                    onClick={() => handleBotDifficulty("easy")}
                  >
                    Easy
                  </ModeButton>
                </Stack>
                <Stack sx={{ alignItems: "center" }} item>
                  <ModeButton
                    sx={{ backgroundColor: "orange", minWidth: "50%" }}
                    variant="contained"
                    onClick={() => handleBotDifficulty("medium")}
                  >
                    Medium
                  </ModeButton>
                </Stack>
                <Stack sx={{ alignItems: "center" }} item>
                  <ModeButton
                    sx={{ backgroundColor: "red", minWidth: "50%" }}
                    variant="contained"
                    color="primary"
                    onClick={() => handleBotDifficulty("hard")}
                  >
                    Hard
                  </ModeButton>
                </Stack>
                <Stack sx={{ alignItems: "center" }} item>
                  <ModeButton
                    sx={{ backgroundColor: "purple", minWidth: "50%" }}
                    variant="contained"
                    onClick={() => handleBotDifficulty("impossible")}
                  >
                    Impossible
                  </ModeButton>
                </Stack>
              </Stack>
            </ModeSelectionPaper>
          ) : (
            <>
              <BoardWrapper>
                <GameInfoBox>
                  <Typography variant="h6" color="primary">
                    {showCoinFlip
                      ? "Flipping coin to decide who starts..."
                      : gameInitialized
                      ? playerStarts
                        ? `You start as ${playerSymbol}`
                        : `Bot starts as ${botSymbol}`
                      : "Preparing game..."}
                  </Typography>
                </GameInfoBox>
                <div
                  className={`scoreboard ${
                    (calculateWinner(currentSquares) ||
                      currentSquares.every((square) => square !== null)) &&
                    showOverlay
                      ? "blur"
                      : ""
                  }`}
                >
                  <div>X Score: {xScore}</div>
                  <div>O Score: {oScore}</div>
                  <div>Draws: {draws}</div>
                  {isOfflineMode && offlineGameType === "bot" && (
                    <button onClick={resetDifficultySelection}>
                      Change Difficulty
                    </button>
                  )}
                  {showCoinFlip && (
                    <CoinFlipOverlay>
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress size={60} />
                        <Typography variant="h5" style={{ color: "white" }}>
                          Flipping coin...
                        </Typography>
                      </Stack>
                    </CoinFlipOverlay>
                  )}
                </div>
                <div className="game">
                  <div className="game-board">
                    <Board
                      xIsNext={xIsNext}
                      squares={currentSquares}
                      onPlay={handleSquareClick}
                      onReset={resetGame}
                      showOverlay={showOverlay}
                      toggleOverlay={toggleOverlay}
                      returnToWinScreen={returnToWinScreen}
                      confettiLaunched={confettiLaunched}
                      setConfettiLaunched={setConfettiLaunched}
                      gameEnded={gameEnded}
                      isBotTurn={isBotTurn || isProcessingTurn}
                      showCoinFlip={showCoinFlip}
                      isOnlineMode={isOnlineMode}
                    />
                  </div>
                  <div
                    className={`game-info ${
                      (calculateWinner(currentSquares) ||
                        currentSquares.every((square) => square !== null)) &&
                      showOverlay
                        ? "blur"
                        : ""
                    }`}
                  >
                    <ol>{moves}</ol>
                  </div>
                </div>
              </BoardWrapper>
            </>
          )}
        </>
      )}
    </div>
  );
}
