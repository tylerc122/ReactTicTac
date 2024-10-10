import Bot from './Bot.js';

// Not possible to win against this guy (in theory I haven't tested it)
export class ImpossibleBot extends Bot {
  // ACQUIRED THIS ALGORITHM FROM CHATGPT
  makeMove(board) {
    const bestMove = this.minimax(board, this.symbol);
    return this.playMove(board, bestMove.index);
}

    minimax(board, player) {
        const availableSpots = this.getEmptyIndexes(board);

        if (this.checkWin(board, this.opponent)) {
            return { score: -10 };
        } else if (this.checkWin(board, this.player)) {
            return { score: 10 };
        } else if (availableSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableSpots.length; i++) {
            const move = {};
            move.index = availableSpots[i];
            board[availableSpots[i]] = player;

            if (player === this.player) {
                const result = this.minimax(board, this.opponent);
                move.score = result.score;
            } else {
                const result = this.minimax(board, this.player);
                move.score = result.score;
            }

            board[availableSpots[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (player === this.player) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    getEmptyIndexes(board) {
        return board.reduce((acc, cell, index) => {
            if (cell === null) acc.push(index);
            return acc;
        }, []);
    }

    checkWin(board, player) {
        const winCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        return winCombos.some(combo => 
            combo.every(index => board[index] === player)
        );
    }
}