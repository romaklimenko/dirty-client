import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-rules-page',
  templateUrl: './rules-page.component.html',
  styleUrls: ['./rules-page.component.css']
})
export class RulesPageComponent implements OnInit {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private apiService: ApiService) { }

  ngOnInit(): void {
  }

  consent() {
    this.apiService.keepalive('/dirty/consent');
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    this.cookieService.set('consent', new Date().getTime().toString(), expires);
    this.router.navigateByUrl('');
  }

  reject() {
    this.apiService.keepalive('/dirty/fuckoff');
    this.cookieService.delete('consent');
    window.location.href = 'https://www.youtube.com/watch?v=qn9FkoqYgI4';
  }

  consentDate() {
    try {
      const date = new Date(parseInt(this.cookieService.get('consent'), 10));
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleString();
    } catch (error) {
      return null;
    }
  }
}
