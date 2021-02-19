import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

type Sorting = 'time' | 'comments' | 'rating' | 'views';

@Component({
  selector: 'app-top-page',
  templateUrl: './top-page.component.html',
  styleUrls: ['./top-page.component.css']
})
export class TopPageComponent implements OnInit {

  top = [];

  sorting: Sorting = 'time';

  ready = false;

  summary = {
    users: [],
    domains: []
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.pruneLocalCache();

    this.apiService.top()
      .then(result => {
        this.top = result;
        this.summary.users = this.groupBy(result, 'user');
        this.summary.domains = this.groupBy(result, 'domain');
        this.ready = true;
      })
      .catch(error => {
        alert(error);
        this.ready = true;
      });
  }

  public changeSorting(sorting: Sorting) {
    if (this.sorting === sorting) {
      return;
    }

    this.sorting = sorting;

    switch (this.sorting) {
      case 'time':
        this.top = this.top.sort((a, b) => {
          if (a.minutes === b.minutes) {
            return a.created < b.created ? 1 : -1;
          }
          return a.minutes < b.minutes ? 1 : -1;
        });
        break;
      case 'comments':
        this.top = this.top.sort((a, b) => {
          if (a.comments_count === b.comments_count) {
            return a.created < b.created ? 1 : -1;
          }
          return a.comments_count < b.comments_count ? 1 : -1;
        });
        break;
      case 'rating':
        this.top = this.top.sort((a, b) => {
          if (a.rating === null && b.rating === null || a.rating === b.rating) {
            return a.created < b.created ? 1 : -1;
          }
          if (a.rating === null || b.rating === null) {
            return 1;
          }
          return a.rating < b.rating ? 1 : -1;
        });
        break;
      case 'views':
        this.top = this.top.sort((a, b) => {
          if (a.views_count === undefined && b.views_count === undefined || a.views_count === b.views_count) {
            return a.created < b.created ? 1 : -1;
          }
          if (a.views_count === undefined || b.views_count === undefined) {
            return 1;
          }
          return a.views_count < b.views_count ? 1 : -1;
        });
        break;
      default:
        break;
    }
  }

  public formatMinutes(minutes: number): string {
    return Math.floor(minutes / 60) + 'ч.&nbsp;' + (minutes % 60 === 0 ? '00' : minutes % 60) + 'мин.';
  }

  epochToString(epoch: number): string {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  groupBy(xs, key) {
    const group = xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

    return Object.keys(group)
      .map(k => {
        return {
          key: k,
          count: group[k].length
        };
      })
      .sort((a, b) => {
        if (a.count > b.count) {
          return -1;
        }
        return 1;
      });
  }

}
