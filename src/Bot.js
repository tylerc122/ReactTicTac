class Bot {
    constructor() {
        this.player = 'O';
        this.opponent = 'X';
    }

    makeMove(board) {
        // Very inexperienced with bot logic, in my head a simple bot will act like this:
        // 1. Try and play a winning move if not possible,
        const winningMove = this.findWinningMove(board, this.player);
        if (winningMove !== -1) {
            return this.playMove(board, winningMove);
        }
        // 2. play a blocking move, preventing the user from winninng, if also not available,
        const blockingMove = this.findWinningMove(board, this.opponent);
        if (blockingMove !== -1) {
            return this.playMove(board, blockingMove);
        }
        // 3. play a random move, later this will be optimized, like finding the best move to play, maybe different difficulties, this would probably be easy bot.
        return this.playRandomMove(board);
    }

    findWinningMove(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Win by row
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Win by col
            [0, 4, 8], [2, 4, 6] // Win by diagonal
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === player && board[b] === player && board[c] == null) {
                return c;
            }
            if (board[a] === player && board[c] === player && board[b] == null) {
                return b;
            }
            if (board[b] === player && board[c] === player && board[a] == null) {
                return a;
            }
        }
        return -1;
    }

    playMove(board, move) {
        const newBoard = [...board];
        newBoard[move] = this.player;
        return newBoard;
    }

    playRandomMove(board) {

        const availableMoves = board.reduce((acc, cell, index) => {
            if (cell == null) {
                acc.push(index);
                return acc;
            }
        }, []);

        if (availableMoves.length === 0) {
            return board;
        }
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return this.playMove(board, randomMove);
    }
}

export default Bot;