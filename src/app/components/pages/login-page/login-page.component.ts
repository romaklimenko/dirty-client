import { Component, OnInit } from '@angular/core';
import { Session } from 'src/app/models/session';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  public errors: [] = [];

  public bannedSync = false;

  constructor(public apiService: ApiService, public router: Router) {
  }

  async ngOnInit() {
    if (!this.apiService.anonymous && !(await this.banned())) {
      this.router.navigateByUrl('');
    }
  }

  async banned() {
    this.bannedSync = await this.apiService.lopata(this.apiService.session?.user?.login) !== 0;
    return this.bannedSync;
  }

  errorCodeToMessage(errorCode: string): string {
    switch (errorCode) {
      case 'invalid_user':
        return 'Неправильное имя пользователя.';
      case 'invalid_password':
        return 'Неправильный пароль.';
      case 'captcha_required':
        return 'Вы так часто неудачно пытались представиться, что сервер теперь требует капчу. \
          А у нас её нет. Подождите несколько минут и попробуйте еще.';
      default:
        return errorCode;
    }
  }

  submit() {
    this.errors = [];

    this.apiService.login(this.loginForm.value.username, this.loginForm.value.password)
      .then((session: Session) => {
        this.banned();
        this.router.navigateByUrl('');
      })
      .catch((httpErrorResponse: HttpErrorResponse) => {
        this.errors = httpErrorResponse.error.errors;
      });
  }

  get anonymous(): boolean {
    return this.apiService.anonymous;
  }
}
