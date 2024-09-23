/// Defines game logic.

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getGameState, updateGameState, updateStats } from './api';
import { useAuth } from './AuthContext';
import { MakeBot } from './bots/MakeBot';

function calculateWinner(squares) {
    if (!Array.isArray(squares)) {
        console.error('Invalid', squares);
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

function Board({ xIsNext, squares, onPlay, onReset, showOverlay, toggleOverlay, returnToWinScreen }) {
    const [confettiLaunched, setConfettiLaunched] = React.useState(false);

    function handleClick(i) {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }

        const nextSquares = squares.slice();

        if (xIsNext) {
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }
        onPlay(nextSquares);
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
    const currentSquares = history[currentMove] || Array(9).fill(null);
    const [botDifficulty, setBotDifficulty] = useState(null);
    const [bot, setBot] = useState(null);

    useEffect(() => {
        if (!isOfflineMode) {
            fetchGameState();
        } else {
            resetGame();
        }
    }, [isOfflineMode, offlineGameType]);

    useEffect(() => {
        if(offlineGameType === 'bot' && botDifficulty){
            setBot(MakeBot.createBot(botDifficulty));
        }
    }, [offlineGameType, botDifficulty]);


    useEffect(() => {
        // Checks if offline, playing against bot, x isn't next, meaning its the bots turn, there's no winner, and some squares are open.
        if (isOfflineMode && offlineGameType === 'bot' && !xIsNext && !calculateWinner(currentSquares) && currentSquares.some(square => square === null))
            // Wait a second before playing a move thru setTimeout
            setTimeout(() => {
                // Make the move thru Bot.js and then handlePlay in this file with the given move.
                const botMove = bot.makeMove(currentSquares);
                handlePlay(botMove);
                // 500 ms delay
            }, 500);
        // Re-renders on given components.
    }, [currentSquares, xIsNext, isOfflineMode, offlineGameType, bot]);

    function handleBotDifficulty(difficulty){
        setBotDifficulty(difficulty);
        setBot(MakeBot.createBot(difficulty));
        resetGame();
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
            } else {
                console.error('Invalid game state:', gameState);
                resetGame();
            }
        } catch (error) {
            console.error('Failed to fetch current game state', error);
            resetGame();
        }
    }

    async function handlePlay(nextSquares) {

        if (gameEnded) {
            return;
        }

        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
        setXIsNext(!xIsNext);

        if (!isOfflineMode) {
            try {
                await updateGameState(nextSquares);
            } catch (error) {
                console.error('Failed to update current game state:', error);
            }
        }

        const newWinner = calculateWinner(nextSquares);
        const newIsDraw = !newWinner && nextSquares.every(square => square !== null);

        if (newWinner || newIsDraw) {
            setGameEnded(true);
            handleGameEnd(newWinner || 'draw');
        }
    }

    const winner = calculateWinner(currentSquares);
    const isDraw = !winner && currentSquares.every(square => square !== null);

    useEffect(() => {
        if (winner) {
            launchConfetti();
        }
    }, [winner]);

    const gameOver = winner || isDraw;

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
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
    }

    async function resetGame() {
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setXIsNext(true);
        setShowOverlay(true);
        setConfettiLaunched(false);
        setGameEnded(false);

        if (!isOfflineMode) {
            try {
                await updateGameState(Array(9).fill(null));
            } catch (error) {
                console.error('Failed to reset game state', error);
            }
        }
    }

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
                    {isOfflineMode && offlineGameType === 'bot' ? (
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
            </div>
            <div className="game">
                <div className="game-board">
                    <Board
                        xIsNext={xIsNext}
                        squares={currentSquares}
                        onPlay={handlePlay}
                        onReset={resetGame}
                        showOverlay={showOverlay}
                        toggleOverlay={toggleOverlay}
                        returnToWinScreen={returnToWinScreen}
                        confettiLaunched={confettiLaunched}
                        setConfettiLaunched={setConfettiLaunched}
                        gameEnded={gameEnded} 
                        />
                </div>
                <div className={`game-info ${(calculateWinner(currentSquares) || currentSquares.every(square => square !== null)) && showOverlay ? 'blur' : ''}`}>
                    <ol>{moves}</ol>
                </div>
            </div>
        </>
    )}
</div>
)};
