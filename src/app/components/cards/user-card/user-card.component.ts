import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  userForm = new FormGroup({
    username: new FormControl('', Validators.required)
  });

  constructor(public router: Router, public apiService: ApiService) { }

  ngOnInit() {
  }

  submit() {
    if (this.userForm.value.username.split(',').length > 1) {
      this.router.navigateByUrl(`/users/${this.userForm.value.username.split(' ').join('').toLowerCase()}`);
    } else {
      this.router.navigateByUrl(`/user/${this.userForm.value.username.split(' ').join('').toLowerCase()}`);
    }
  }

}
