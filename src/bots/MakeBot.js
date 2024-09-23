import { EasyBot } from './EasyBot.js';
import { MediumBot } from './MediumBot.js';
import { HardBot } from './HardBot.js';
import { ImpossibleBot } from './ImpossibleBot.js';

export class MakeBot {
    static createBot(difficulty) {
      switch (difficulty) {
        case 'easy':
          return new EasyBot();
        case 'medium':
          return new MediumBot();
        case 'hard':
          return new HardBot();
        case 'impossible':
            return new ImpossibleBot();
        default:
          throw new Error('Invalid difficulty level');
      }
    }
  }