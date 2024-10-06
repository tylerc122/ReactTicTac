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

function Board({ xIsNext, squares, onPlay, onReset, showOverlay, toggleOverlay, returnToWinScreen, showCoinFlip, isBotTurn, isProcessingTurn }) {
    const [confettiLaunched, setConfettiLaunched] = React.useState(false);

    function handleClick(i) {
        if (isBotTurn || isProcessingTurn || showCoinFlip || squares[i] || calculateWinner(squares)) {
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
    const [difficultySelected, setDifficultySelected] = useState(false);
    const [playerStarts, setPlayerStarts] = useState(true);
    const [showCoinFlip, setShowCoinFlip] = useState(false);
    const [shouldCoinFlip, setShouldCoinFlip] = useState(false);
    const [gameInitialized, setGameInitialized] = useState(false);
    const [isBotTurn, setIsBotTurn] = useState(false);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [playerSymbol, setPlayerSymbol] = useState('X');
    const [botSymbol, setBotSymbol] = useState('O');

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
        // Check if it's the bot's turn
        const isBotMove = (botSymbol === 'X' && xIsNext) || (botSymbol === 'O' && !xIsNext);
        if (isOfflineMode && offlineGameType === 'bot' && isBotMove && !calculateWinner(currentSquares) && gameInitialized && !showCoinFlip && currentSquares.some(square => square === null)) {
            setIsBotTurn(true);
            setIsProcessingTurn(true);
            const timer = setTimeout(() => {
                const botMove = bot.makeMove(currentSquares);
                handlePlay(botMove);
                setIsBotTurn(false);
                setIsProcessingTurn(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentSquares, xIsNext, isOfflineMode, offlineGameType, bot, gameInitialized, showCoinFlip, botSymbol]);

    function coinFlip() {
        if(showCoinFlip || gameInitialized) return;
        setShowCoinFlip(true);
        setTimeout(() => {
            const result = Math.random() < 0.5;
            setPlayerStarts(result);
            setXIsNext(true); // X always starts
            setPlayerSymbol(result ? 'X' : 'O');
            setBotSymbol(result ? 'O' : 'X');
            setIsBotTurn(!result);
            setShowCoinFlip(false);
            setGameInitialized(true);
        }, 1000);
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
            setIsProcessingTurn(false);
            return;
        }

        // Determine the current player's symbol
        const currentPlayerSymbol = xIsNext ? 'X' : 'O';

        // Update the squares with the correct symbol
        const updatedSquares = nextSquares.map((square, index) => {
            if (square !== currentSquares[index]) {
                return currentPlayerSymbol;
            }
            return square;
        });

        const nextHistory = [...history.slice(0, currentMove + 1), updatedSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
        setXIsNext(!xIsNext);

        if (!isOfflineMode) {
            try {
                await updateGameState(updatedSquares);
            } catch (error) {
                console.error('Failed to update current game state:', error);
            }
        }

        const newWinner = calculateWinner(updatedSquares);
        const newIsDraw = !newWinner && updatedSquares.every(square => square !== null);

        if (newWinner || newIsDraw) {
            setGameEnded(true);
            handleGameEnd(newWinner || 'draw');
        }
        setIsProcessingTurn(false);
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

        setTimeout(() => {
            setGameInitialized(false);
        }, 2000);
    }

    async function resetGame() {
        if(showCoinFlip || (!gameEnded && gameInitialized)) return;

        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setShowOverlay(true);
        setConfettiLaunched(false);
        setGameEnded(false);
        coinFlip();

        if (!isOfflineMode) {
            try {
                await updateGameState(Array(9).fill(null));
            } catch (error) {
                console.error('Failed to reset game state', error);
            }
        }
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
                {showCoinFlip ? (
                    <div>Flipping coin...</div>
                ) : (
                    <div>
                        {playerStarts ? `You start as ${playerSymbol}` : `Bot starts as ${botSymbol}`}
                    </div>
                )}
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
                        isBotTurn={isBotTurn || isProcessingTurn}
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
