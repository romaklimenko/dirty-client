import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { VotersResponse } from 'src/app/models/voters-response';

type Tab = 'domain' | 'elections';

@Component({
  selector: 'app-domain-page',
  templateUrl: './domain-page.component.html',
  styleUrls: ['./domain-page.component.css']
})
export class DomainPageComponent implements OnInit {

  @ViewChild('svgElementLeaders') svgElementLeaders: ElementRef;

  prefix: string;

  ready: boolean;

  voters: VotersResponse;

  domain: any = null;

  @ViewChild('widthStandard') widthStandard: ElementRef;

  currentTab: Tab = 'domain';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {
    this.apiService.checkSession();
    this.route.paramMap.subscribe(async (paramMap) => {
      this.prefix = paramMap.get('domain').toLowerCase();

      this.domain = await this.apiService.domain(this.prefix);

      this.selectTab('domain');

      this.ready = true;

      this.apiService.domainVotes(this.prefix).then(d => this.voters = d);
    });
  }

  selectTab(tab: Tab): void {
    this.currentTab = tab;
    this.apiService.keepalive(`/dirty/domain/${this.prefix}/tab/${tab}/`);
  }

  width(): number {
    return this.widthStandard.nativeElement.clientWidth;
  }

}
