import { User } from './user';

export class Comment {
  created: number;
  datetime?: Date;
  rating?: number;
  user: User;
}
