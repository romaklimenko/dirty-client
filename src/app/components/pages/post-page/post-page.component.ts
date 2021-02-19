import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from 'src/app/models/post';
import { Comment } from 'src/app/models/comment';
import { Vote } from 'src/app/models/vote';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['./post-page.component.css']
})
export class PostPageComponent implements OnInit {

  @ViewChild('widthStandard') widthStandard: ElementRef;

  ready: boolean;

  postId: string;

  post: Post = null;

  comments: Comment[] = [];
  votes: Vote[] = [];

  firstComments: Comment[] = [];
  firstVotes: Vote[] = [];

  constructor(
    private route: ActivatedRoute,
    public apiService: ApiService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (paramMap) => {
      this.postId = paramMap.get('post');

      try {
        // post
        this.post = await this.apiService.post(this.postId);
        this.ready = true;
      } catch (error) {
        console.error(error);
      }

      // post comments
      this.apiService.comments(this.postId).then((comments) => {
        this.comments = comments;
        this.firstComments = comments.filter(c => c.created <= this.post.created + 7 * 24 * 60 * 60);
      }).catch(error => {
        console.error(error);
      });

      // post votes
      this.apiService.postVotes(this.postId).then((votes) => {
        this.votes = votes;
        this.firstVotes = votes.filter(c => c.changed <= this.post.created + 1 * 24 * 60 * 60);
      }).catch(error => {
        console.error(error);
      });
    });
  }

  width(): number {
    return this.widthStandard.nativeElement.clientWidth;
  }

  epochToString(epoch: number) {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString() + ' в ' + date.toLocaleTimeString();
  }

}
