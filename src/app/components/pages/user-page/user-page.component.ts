import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ActivitiesResponse } from 'src/app/models/activities-response';
import { KarmaVote } from 'src/app/models/karma-vote';
import { VotersResponse } from 'src/app/models/voters-response';
import { Activity } from 'src/app/models/activity';

type Tab = 'activity' | 'karma' | 'rating' | 'bans';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent implements OnInit {

  username: string;

  activities: ActivitiesResponse;

  allActivities: Activity[];

  voters: VotersResponse;

  karma: KarmaVote[] = [];

  ready: boolean;

  bans: any = null;

  @ViewChild('widthStandard') widthStandard: ElementRef;

  currentTab: Tab = 'activity';

  constructor(
    private route: ActivatedRoute,
    public apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.checkSession();
    this.apiService.pruneLocalCache();

    this.route.paramMap.subscribe(async (paramMap) => {
      try {
        this.username = paramMap.get('user');
  
        this.selectTab('activity');
        this.activities = await this.apiService.activities(this.username);
        this.allActivities = this.activities.posts.slice();
        this.allActivities.push(...this.activities.comments);
        this.karma = await this.apiService.karma(this.username);
        this.apiService.votes(this.username).then((voters: VotersResponse) => {
          this.voters = voters;
        });
        this.bans = await this.apiService.bans(this.username);
      } catch (error) {
        console.error(error);
      } finally {
        this.ready = true;
      }
    });
  }

  selectTab(tab: Tab): void {
    this.currentTab = tab;
    this.apiService.keepalive(`/dirty/user/${this.username}/tab/${tab}/`);
  }

  width(): number {
    return this.widthStandard.nativeElement.clientWidth;
  }

  epochToDate(epoch: number) {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
