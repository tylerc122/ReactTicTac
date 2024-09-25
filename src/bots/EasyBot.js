import  Bot  from './Bot.js';

// Easy bot only plays random moves
export class EasyBot extends Bot {
    makeMove(board){
        return this.playRandomMove(board);
    }
}