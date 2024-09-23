import { Bot } from './Bot.js';

export class MediumBot extends Bot {
    makeMove(board){
       const winningMove  = this.makeWinningMove(board, this.player);
       if(this.winningMove !== -1){
        return this.playMove(board, winningMove);
        
       }
       return this.playRandomMove(board);
    }
}