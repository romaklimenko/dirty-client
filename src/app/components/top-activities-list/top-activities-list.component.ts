import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ActivitiesResponse } from 'src/app/models/activities-response';
import { ApiService } from 'src/app/services/api.service';
import { epochToDateTime } from 'src/app/tools/epochToDateTime';

@Component({
  selector: 'app-top-activities-list',
  templateUrl: './top-activities-list.component.html',
  styleUrls: ['./top-activities-list.component.css']
})
export class TopActivitiesListComponent implements OnInit {

  @Input() username: string;
  @Input() activities: ActivitiesResponse;

  posts = { };

  topUpvotedPosts: any[] = [];

  topDownvotedPosts: any[] = [];

  topUpvotedComments: any[] = [];

  topDownvotedComments: any[] = [];

  constructor(public apiService: ApiService) { }

  epochToDateString(epoch: number): string {
    return epochToDateTime(epoch).toLocaleDateString();
  }

  ngOnInit(): void {
    this.render();
  }

  async render() {
    const numberOfActivities = 10;

    this.topDownvotedPosts = this.activities.posts
      .filter(a => a.rating < 0)
      .map(a => Object.assign({}, a))
      .sort((a, b) => a.rating > b.rating ? 1 : -1)
      .slice(0, numberOfActivities);

    this.topUpvotedPosts = this.activities.posts
      .filter(a => a.rating > 0)
      .map(a => Object.assign({}, a))
      .sort((a, b) => a.rating < b.rating ? 1 : -1)
      .slice(0, numberOfActivities);

    this.topDownvotedComments = this.activities.comments
      .filter(a => a.rating < 0)
      .map(a => Object.assign({}, a))
      .sort((a, b) => a.rating > b.rating ? 1 : -1)
      .slice(0, numberOfActivities);

    this.topUpvotedComments = this.activities.comments
      .filter(a => a.rating > 0)
      .map(a => Object.assign({}, a))
      .sort((a, b) => a.rating < b.rating ? 1 : -1)
      .slice(0, numberOfActivities);

    this.topUpvotedPosts.forEach(post => this.posts[post.id] = { });
    this.topDownvotedPosts.forEach(post => this.posts[post.id] = { });
    this.topUpvotedComments.forEach(comment => this.posts[comment.post_id] = { });
    this.topDownvotedComments.forEach(comment => this.posts[comment.post_id] = { });

    Object.keys(this.posts).forEach(async postId => {
      const post = await this.apiService.post(postId);
      if (post !== null) {
        this.posts[postId] = post;
      }
    });
  }
}
