import { User } from './user';

export class KarmaVote {
  vote: number;
  changed: number;
  user: User;
  karma: number;
  from?: string;
  deleted?: boolean;
}
