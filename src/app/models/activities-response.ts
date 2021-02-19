import { Activity } from './activity';

export class ActivitiesResponse {
  user: string;
  posts: Activity[];
  comments: Activity[];
}
