import React, { useState } from 'react';
import confetti from 'canvas-confetti';

function calculateWinner(squares) {
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

function Board({ xIsNext, squares, onPlay, onReset, showOverlay, toggleOverlay, returnToWinScreen, confettiLaunched, setConfettiLaunched }) {
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
    if (winner) {
        status = "Winner: " + winner + "!";
        if (!confettiLaunched) {
            launchConfetti(); // CONFETTI!!!!!
            setConfettiLaunched(true);
        }
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

export default function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [xScore, setXScore] = useState(0);
    const [oScore, setOScore] = useState(0);
    const [draws, setDraws] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);
    const [confettiLaunched, setConfettiLaunched] = useState(false);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    const winner = calculateWinner(currentSquares);
    const isDraw = !winner && currentMove === 9;

    const gameOver = winner || isDraw;

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    function resetGame() {
        if (winner) {
            if (winner === 'X') {
                setXScore(xScore + 1);
            } else {
                setOScore(oScore + 1);
            }
        } else if (isDraw) {
            setDraws(draws + 1);
        }
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setShowOverlay(true);
        setConfettiLaunched(false);
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
            <div className={`scoreboard ${gameOver && showOverlay ? 'blur' : ''}`}>
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
                        setConfettiLaunched={setConfettiLaunched} />
                </div>
                <div className={`game-info ${gameOver && showOverlay ? 'blur' : ''}`}>
                    <ol>{moves}</ol>
                </div>
            </div>
        </div>
    );
}
