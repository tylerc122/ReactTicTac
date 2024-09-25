import  Bot  from './Bot.js';

// Medium bot only tries to win.
export class MediumBot extends Bot {
    makeMove(board) {
        const winningMove = this.findWinningMove(board, this.player);
        if (winningMove !== -1) {
            return this.playMove(board, winningMove);
        }
        return this.playRandomMove(board);
    }
}