import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.css']
})
export class GreetingComponent implements OnInit {

  constructor(
    public cookieService: CookieService,
    public apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  get login(): string {
    return this.apiService.session?.user?.login;
  }

  logout() {
    this.apiService.resetSession();
    this.router.navigateByUrl('/login');
  }
}
