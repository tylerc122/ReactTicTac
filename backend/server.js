const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes");
const http = require("http");
const socketIo = require("socket.io");
const User = require("./models/User");

dotenv.config();

const corsOptions = {
  origin: [
    "https://react-tic-tac-coral.vercel.app",
    "https://tictactyler.com",
    "https://www.tictactyler.com",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

let waitingPlayers = new Map(); // Modifying this to store more info
let activeGames = new Map();

// Define connection listener
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("userConnected", async (userData) => {
    try {
      const user = await User.findById(userData.userId);
      if (user) {
        socket.userData = {
          userId: user._id,
          username: user.username,
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  });

  socket.on("findMatch", async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found:", userId);
        return;
      }

      console.log(`User ${userId} is looking for a match`);
      waitingPlayers.delete(userId);

      for (let [waitingUserId, waitingSocket] of waitingPlayers) {
        if (waitingUserId !== userId) {
          // Match found
          const waitingUser = await User.findById(waitingUserId);
          if (!waitingUser) continue;

          const gameId = Math.random().toString(36).substring(2, 9);

          waitingSocket.emit("matchFound", {
            gameId,
            opponent: {
              id: userId,
              username: user.username,
            },
            start: true,
            symbol: "X",
          });

          socket.emit("matchFound", {
            gameId,
            opponent: {
              waitingUserId,
              username: waitingUser.username,
            },
            start: false,
            symbol: "O",
          });

          activeGames.set(gameId, {
            players: [
              {
                id: waitingUserId,
                username: waitingUser.username,
                socket: waitingSocket,
                symbol: "X",
              },
              {
                id: userId,
                username: user.username,
                socket: socket,
                symbol: "O",
              },
            ],
            currentTurn: waitingUserId,
            board: Array(9).fill(null),
          });
          console.log(
            `Match found: ${waitingUser.username} vs ${user.username}, Game ID: ${gameId}`
          );
          return;
        }
      }

      // No match found, add to waiting list
      waitingPlayers.set(userId, socket);
      socket.emit("waiting");
      console.log(`User ${userId} added to waiting list`);
    } catch (error) {
      console.error("Error in findMatch:", error);
    }
  });

  socket.on("cancelMatch", (userId) => {
    console.log(`User ${userId} cancelled match search`);
    waitingPlayers.delete(userId);
  });

  socket.on("move", ({ gameId, position, player }) => {
    const game = activeGames.get(gameId);
    if (game) {
      const currentPlayerIndex = game.players.findIndex((p) => p.id === player);
      const opponentIndex = 1 - currentPlayerIndex;

      if (game.currentTurn === game.players[currentPlayerIndex].id) {
        const symbol = game.players[currentPlayerIndex].symbol;
        game.board[position] = symbol;
        game.players[opponentIndex].socket.emit("opponentMove", {
          position,
          player: symbol,
        });

        // Switch turns
        game.currentTurn = game.players[opponentIndex].id;

        // Notify both players about the turn change
        game.players[currentPlayerIndex].socket.emit("turnChange", {
          isYourTurn: false,
        });
        game.players[opponentIndex].socket.emit("turnChange", {
          isYourTurn: true,
        });

        console.log(
          `Move made by ${player} (${symbol}) at position ${position} in game ${gameId}`
        );
        console.log(`Current board state: ${game.board}`);
      } else {
        console.log(`Invalid move attempt by ${player} in game ${gameId}`);
      }
    } else {
      console.log(`Game ${gameId} not found`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Remove from waiting players if disconnected while waiting
    for (let [userId, waitingSocket] of waitingPlayers) {
      if (waitingSocket.id === socket.id) {
        waitingPlayers.delete(userId);
        console.log(`Removed disconnected user ${userId} from waiting list`);
        break;
      }
    }
    // Handle disconnection in active games
    for (let [gameId, game] of activeGames) {
      const disconnectedPlayerIndex = game.players.findIndex(
        (p) => p.socket.id === socket.id
      );
      if (disconnectedPlayerIndex !== -1) {
        const opponentIndex = 1 - disconnectedPlayerIndex;
        game.players[opponentIndex].socket.emit("opponentDisconnected");
        activeGames.delete(gameId);
        console.log(`Game ${gameId} ended due to player disconnection`);
        break;
      }
    }
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5001;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please choose a different port or close the application using this port.`
    );
    process.exit(1);
  } else {
    console.error("An error occurred:", error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Cleared waiting players");
});
