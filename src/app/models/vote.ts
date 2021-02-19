import { User } from './user';

export class Vote {
  changed: number;
  datetime?: Date;
  rating?: number;
  clearRating?: number;
  user: User;
  vote: number;
}
