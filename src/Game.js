/// Defines game logic.

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getGameState, updateGameState, updateStats } from './api';
import { useAuth } from './AuthContext';
import { MakeBot } from './bots/MakeBot';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function calculateWinner(squares) {
    if (!Array.isArray(squares)) {
        console.error('Invalid squares:', squares);
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
        [2, 4, 6]
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
    return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function Board({ xIsNext, squares, onPlay, onReset, showOverlay, toggleOverlay, returnToWinScreen, showCoinFlip, isBotTurn, isProcessingTurn }) {
    const [confettiLaunched, setConfettiLaunched] = React.useState(false);

    function handleClick(i) {
        if (showCoinFlip || isBotTurn || isProcessingTurn || squares[i] || calculateWinner(squares)) {
            return;
        }
        onPlay(i);
    }

    const winner = calculateWinner(squares);
    const isDraw = !winner && squares.every(square => square !== null);
    let status;
    React.useEffect(() => {
        if (winner && !confettiLaunched) {
            launchConfetti(); // CONFETTI!!!!!
            setConfettiLaunched(true);
        }
    }, [winner, confettiLaunched]);
    if (winner) {
        status = "Winner: " + winner + "!";
    } else if (isDraw) {
        status = "It's a draw!";
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
        <>
            <div className="board-container">
                <div className={`board ${winner || isDraw ? (showOverlay ? 'blur' : '') : ''}`}>
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
                {(winner || isDraw) && showOverlay && (
                    <div className="winner-overlay">
                        <div>{status}</div>
                        <button className="replay-button" onClick={onReset}>Replay?</button>
                        <button className="toggle-blur-button" onClick={toggleOverlay}>Toggle Blur</button>
                    </div>
                )}

                {(winner || isDraw) && !showOverlay && (
                    <button className="return-win-screen-button" onClick={returnToWinScreen}>
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
            y: 1
        },
        ticks: 90,
    });
}

export default function Game({ isOfflineMode, offlineGameType }) {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [xIsNext, setXIsNext] = useState(true);
    const [xScore, setXScore] = useState(0);
    const [oScore, setOScore] = useState(0);
    const [draws, setDraws] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);
    const [confettiLaunched, setConfettiLaunched] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const { user, updateUser } = useAuth();
    const [currentSquares, setCurrentSquares] = useState(Array(9).fill(null));
    const [botDifficulty, setBotDifficulty] = useState(null);
    const [bot, setBot] = useState(null);
    const [difficultySelected, setDifficultySelected] = useState(false);
    const [playerStarts, setPlayerStarts] = useState(true);
    const [showCoinFlip, setShowCoinFlip] = useState(false);
    const [shouldCoinFlip, setShouldCoinFlip] = useState(false);
    const [gameInitialized, setGameInitialized] = useState(false);
    const [isBotTurn, setIsBotTurn] = useState(false);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [botSymbol, setBotSymbol] = useState('O');
    const [isOnlineMode, setIsOnlineMode] = useState(!isOfflineMode);
    const [gameId, setGameId] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);

    useEffect(() => {
        if (isOnlineMode) {
            socket.on('matchFound', ({ gameId, opponent, start, symbol }) => {
                setGameId(gameId);
                setOpponent(opponent);
                setIsWaiting(false);
                setPlayerSymbol(symbol);
                setIsMyTurn(start);
                setGameInitialized(true);
                setHistory([Array(9).fill(null)]);
                setCurrentMove(0);
                setXIsNext(true); 
                setCurrentSquares(Array(9).fill(null));
                console.log(`Match found. You are ${symbol}. ${start ? 'Your turn' : "Opponent's turn"}`);
            });

            socket.on('opponentMove', ({ position, player }) => {
                setCurrentSquares(prevSquares => {
                    const nextSquares = [...prevSquares];
                    nextSquares[position] = player;
                    return nextSquares;
                });
                setXIsNext(prevXIsNext => !prevXIsNext);
                console.log(`Opponent moved: ${player} at position ${position}`);
            });

            socket.on('turnChange', ({ isYourTurn }) => {
                setIsMyTurn(isYourTurn);
                console.log(`Turn changed. Is it your turn? ${isYourTurn}`);
            });

            socket.on('opponentDisconnected', () => {
                console.log('Opponent disconnected');
                // Handle opponent disconnection (e.g., end game, show message)
                setGameEnded(true);
                setShowOverlay(true);
                // Should probably display a diff message for a disconnection
            });

            return () => {
                socket.off('matchFound');
                socket.off('opponentMove');
                socket.off('turnChange');
                socket.off('opponentDisconnected');
            };
        }
    }, [isOnlineMode]);

    useEffect(() => {
        setIsOnlineMode(!isOfflineMode);
    }, [isOfflineMode]);

    useEffect(() => {
        if (!isOfflineMode) {
            fetchGameState();
        } else {
            setGameInitialized(false);
        }
        setDifficultySelected(false);
    }, [isOfflineMode, offlineGameType]);

    useEffect(() => {
        if(offlineGameType === 'bot' && botDifficulty){
            setBot(MakeBot.createBot(botDifficulty));
            setGameInitialized(false);
        }
    }, [offlineGameType, botDifficulty]);

    useEffect(() => {
        if(!gameInitialized && !gameEnded){
            resetGame();
        }
    }, [gameInitialized, gameEnded]);

    useEffect(() => {
        const isBotMode = isOfflineMode && offlineGameType === 'bot';
        const isBotMove = isBotMode && isBotTurn;
        
        if (isBotMove && !calculateWinner(currentSquares) && gameInitialized && !showCoinFlip && currentSquares.some(square => square === null)) {
            setIsProcessingTurn(true);
            const timer = setTimeout(() => {
                const botMove = bot.makeMove(currentSquares);
                const nextSquares = currentSquares.slice();
                const moveIndex = botMove.findIndex((square, index) => square !== currentSquares[index]);
                if (moveIndex !== -1) {
                    nextSquares[moveIndex] = botSymbol;
                    handlePlay(nextSquares, false);
                } else {
                    console.error("Bot did not make a valid move");
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentSquares, isBotTurn, isOfflineMode, offlineGameType, bot, gameInitialized, showCoinFlip, botSymbol]);

    function handleFindMatch() {
        if (user) {
            socket.emit('findMatch', user.id);
            setIsWaiting(true);
        }
    }

    function handleCancelMatch() {
        socket.emit('cancelMatch', user.id);
        setIsWaiting(false);
    }

    function coinFlip() {
        if (isOfflineMode && offlineGameType === 'bot') {
            if (showCoinFlip) return;
            setTimeout(() => {
                const result = Math.random() < 0.5;
                setPlayerStarts(result);
                setXIsNext(true); // X always starts
                setPlayerSymbol(result ? 'X' : 'O');
                setBotSymbol(result ? 'O' : 'X');
                setIsBotTurn(!result);
                setShowCoinFlip(false);
                setGameInitialized(true);
                setIsProcessingTurn(false);
            }, 1000);
        } else {
            setXIsNext(true);
            setGameInitialized(true);
            setIsProcessingTurn(false);
        }
    }

    useEffect(() => {
        if (isOfflineMode && offlineGameType === 'bot' && bot) {
            bot.setSymbol(botSymbol);
        }
    }, [botSymbol, isOfflineMode, offlineGameType, bot]);

    function handleBotDifficulty(difficulty){
        setBotDifficulty(difficulty);
        setBot(MakeBot.createBot(difficulty));
        setDifficultySelected(true);
        resetGame();
    }

    function resetDifficultySelection(){
        setDifficultySelected(false);
        setBotDifficulty(null);
        setBot(null);
        setGameInitialized(false);
    }
    
    async function fetchGameState() {
        try {
            const gameState = await getGameState();
            if (Array.isArray(gameState) && gameState.length === 9) {
                setHistory([gameState]);
                setCurrentMove(gameState.filter(square => square !== null).length);
                // Based on where we are in the game, assign these vars.
                setXIsNext((gameState.filter(square => square !== null).length) % 2 === 0);
                setGameEnded(calculateWinner(gameState) !== null || gameState.every(square => square !== null));
                setCurrentSquares(gameState);
            } else {
                console.error('Invalid game state:', gameState);
                resetGame();
            }
        } catch (error) {
            console.error('Failed to fetch current game state', error);
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
        const newIsDraw = !newWinner && nextSquares.every(square => square !== null);
    
        if (newWinner || newIsDraw) {
            setGameEnded(true);
            setShowOverlay(true);
            handleGameEnd(newWinner || 'draw');
        } else {
            setXIsNext(!xIsNext);
            if (isOnlineMode) {
                setIsMyTurn(false);
            } else if (offlineGameType === 'bot') {
                setIsBotTurn(isPlayerMove);
            }
        }
    
        setIsProcessingTurn(false);
    }

    useEffect(() => {
        console.log('Current squares:', currentSquares);
    }, [currentSquares]);

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
        setCurrentSquares(history[nextMove]);
        setXIsNext(nextMove % 2 === 0);
    }

    async function handleGameEnd(result) {
        if (result === 'X') {
            setXScore(xScore + 1);
        } else if (result === 'O') {
            setOScore(oScore + 1);
        } else {
            setDraws(draws + 1);
        }

        if (!isOfflineMode && user) {
            try {
                let statResult;
                if (result === 'X' && xIsNext) statResult = 'win';
                else if (result === 'O' && !xIsNext) statResult = 'loss';
                else if (result === 'draw') statResult = 'draw';

                const updatedStats = await updateStats(user._id, statResult);
                setXScore(updatedStats.wins);
                setOScore(updatedStats.losses);
                setDraws(updatedStats.draws);

                await updateGameState(Array(9).fill(null));
                
                updateUser({
                    ...user,
                    stats: updatedStats
                });

            } catch (error) {
                console.error('Failed to update overall stats:', error);
            }
        }

        // Remove the timeout here to keep the game in the end state until the player chooses to reset
        setGameInitialized(false);
    }

    function handleSquareClick(i) {
        if (isOnlineMode) {
            if (!isMyTurn || currentSquares[i] || calculateWinner(currentSquares)) return;

            const nextSquares = [...currentSquares];
            nextSquares[i] = playerSymbol;
            setCurrentSquares(nextSquares);
            setXIsNext(!xIsNext);
            socket.emit('move', { gameId, position: i, player: user.id });
            setIsMyTurn(false); // Immediately set to false after making a move
            console.log(`You moved: ${playerSymbol} at position ${i}`);
            // Bot mode
        } else if (offlineGameType === 'bot') {
            if (showCoinFlip || isBotTurn || isProcessingTurn || currentSquares[i] || calculateWinner(currentSquares)) {
                return;
            }
            const nextSquares = currentSquares.slice();
            nextSquares[i] = playerSymbol;
            handlePlay(nextSquares, true);
            // Couch play
        } else {
            if (currentSquares[i] || calculateWinner(currentSquares)) return;
            const nextSquares = currentSquares.slice();
            nextSquares[i] = xIsNext ? 'X' : 'O';
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

        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setConfettiLaunched(false);
        setCurrentSquares(Array(9).fill(null));

        if (!isOfflineMode) {
            updateGameState(Array(9).fill(null)).catch(error => {
                console.error('Failed to reset game state', error);
            });
        }

        if(isOfflineMode && offlineGameType === 'bot'){
            setShowCoinFlip(true);
        } else {
            setShowCoinFlip(false);
        }
        // Trigger coin flip immediately
        coinFlip();
    }

    useEffect(() => {
        if(shouldCoinFlip){
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
            description = 'Go to move #' + move;
        } else {
            description = 'Go to game start';
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
                    <div className="scoreboard">
                        <div>X Score: {xScore}</div>
                        <div>O Score: {oScore}</div>
                        <div>Draws: {draws}</div>
                    </div>
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
                        <>
                            <p>Playing against: {opponent}</p>
                            <p>You are: {playerSymbol || 'Waiting for symbol...'}</p>
                            <p>{isMyTurn ? "Your turn" : "Opponent's turn"}</p>
                        </>
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
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {isOfflineMode && offlineGameType === 'bot' && !difficultySelected ? (
                        <div className="bot-difficulty-selection">
                            <h2>Select Bot Difficulty</h2>
                            <button onClick={() => handleBotDifficulty('easy')}>Easy</button>
                            <button onClick={() => handleBotDifficulty('medium')}>Medium</button>
                            <button onClick={() => handleBotDifficulty('hard')}>Hard</button>
                            <button onClick={() => handleBotDifficulty('impossible')}>Impossible</button>
                        </div>
                    ) : (
                        <>
                            <div className={`scoreboard ${(calculateWinner(currentSquares) || currentSquares.every(square => square !== null)) && showOverlay ? 'blur' : ''}`}>
                                <div>X Score: {xScore}</div>
                                <div>O Score: {oScore}</div>
                                <div>Draws: {draws}</div>
                                {isOfflineMode && offlineGameType === 'bot' && (
                                    <button onClick={resetDifficultySelection}>Change Difficulty</button>
                                )}
                                {isOfflineMode && offlineGameType === 'bot' ? (
                                    showCoinFlip ? (
                                        <div>Flipping coin...</div>
                                    ) : (
                                        <div>
                                            {playerStarts ? `You start as ${playerSymbol}` : `Bot starts as ${botSymbol}`}
                                        </div>
                                    )
                                ) : null}
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
                                    />
                                </div>
                                <div className={`game-info ${(calculateWinner(currentSquares) || currentSquares.every(square => square !== null)) && showOverlay ? 'blur' : ''}`}>
                                    <ol>{moves}</ol>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}