import { User } from './user';

export class Post {
  id: number;
  created: number;
  rating?: number;
  user: User;
  tops: any; // TODO: type
  title: string;
}
