import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';

declare global {
  interface Window {
    gtag: (...arguments: any) => void;
    keepalive: (url: string) => void;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dirty';

  constructor(public router: Router, public apiService: ApiService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scroll(0, 0);
        const url = `/dirty${event.urlAfterRedirects}`;
        this.apiService.keepalive(url);
      }
    });
  }

  onKey(event: KeyboardEvent) {
    // console.log(event);

    const element = event.target as HTMLElement;

    if (element.tagName.toUpperCase() === 'INPUT') {
      const input = (element as HTMLInputElement);
      const type = input.type.toUpperCase();
      if (type === 'TEXT' || type === 'PASSWORD') {
        return;
      }
    }

    switch (event.code) {
      case 'KeyH': // Home
        this.router.navigateByUrl('/');
        break;
      case 'KeyI': // Home
        if (!this.apiService.anonymous) {
          this.router.navigateByUrl(`/user/${this.apiService.session.user.login}`);
        }
        break;
      case 'KeyN': // Notes
        this.router.navigateByUrl('/notes');
        break;
      case 'KeyT': // Top
        this.router.navigateByUrl('/top');
        break;
      default:
        break;
    }
  }
}
