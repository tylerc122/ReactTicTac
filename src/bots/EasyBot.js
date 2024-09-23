import  Bot  from './Bot.js';

export class EasyBot extends Bot {
    makeMove(board){
        return this.playRandomMove(board);
    }
}