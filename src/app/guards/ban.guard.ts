import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class BanGuard implements CanActivateChild {

  constructor(private apiService: ApiService, private router: Router) { }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return (async () => {
        if (this.apiService.anonymous) {
          this.router.navigateByUrl('/login');
          return false;
        }

        const lopata = await this.apiService.lopata(this.apiService.session.user?.login);

        switch (lopata) {
          case 0:
            return true;
          case 2:
            this.apiService.keepalive(`/dirty/${this.apiService.session.user?.login}/fucked`);
            window.location.href = 'https://storage.googleapis.com/dirty-public/fuckoff.gif';
            return false;
          default:
            this.router.navigateByUrl('/login');
            return false;
        }
      })();

  }
}
