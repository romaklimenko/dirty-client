import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ConsentGuard implements CanActivate, CanActivateChild {

  constructor(private cookieService: CookieService, private router: Router) { }

  private can() {
    try {
      const date = new Date(parseInt(this.cookieService.get('consent'), 10));
      if (isNaN(date.getTime())) {
        return this.router.parseUrl('/welcome');
      }
      return true;
    } catch (error) {
      return this.router.parseUrl('/welcome');
    }
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.can();
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.can();
  }

}
