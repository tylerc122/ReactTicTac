import { Bot } from './Bot.js';

export class HardBot extends Bot {
    makeMove(board) {
      const winningMove = this.findWinningMove(board, this.player);
      if (winningMove !== -1) {
        return this.playMove(board, winningMove);
      }
      const blockingMove = this.findWinningMove(board, this.opponent);
      if (blockingMove !== -1) {
        return this.playMove(board, blockingMove);
      }
      
      return this.playRandomMove(board);
    }
  }