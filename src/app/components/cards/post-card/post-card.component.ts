import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { postId } from 'src/app/tools/postId';
import { Post } from 'src/app/models/post';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit {
  postForm = new FormGroup({
    post: new FormControl('', [
      Validators.required,
      this.postUrlValidator
    ])
  });

  posts: Post[] = [];

  constructor(public router: Router, public apiService: ApiService) { }

  async ngOnInit() {
    if (!this.apiService.anonymous) {
      this.posts = await this.apiService.recentPosts(this.apiService.session?.user?.login);
    }
  }

  submit() {
    const id = postId(this.postForm.value.post);
    if (id) {
      this.router.navigateByUrl(`/post/${id}`);
    }
  }

  postUrlValidator(control: AbstractControl): ValidationErrors | null {
    return postId(control.value) === null ? { postUrl: { value: control.value } } : null;
  }

}
