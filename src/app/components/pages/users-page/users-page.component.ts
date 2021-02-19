import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { google10c } from 'src/app/tools/google10c';
import * as d3 from 'd3';
import { KarmaVote } from 'src/app/models/karma-vote';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit, AfterViewInit {

  @ViewChild('svgElement') svgElement: ElementRef;

  ready = false;

  usernames: string[];

  legends: any[];

  activities: object = {};

  karma: KarmaVote[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.apiService.pruneLocalCache();

    this.route.paramMap.subscribe(paramMap => {
      this.usernames = paramMap.get('users').split(',');
    });
  }

  ngAfterViewInit(): void {
    this.getData();
  }

  getData() {
    Promise
      .all(this.usernames.map(u => this.apiService.activities(u)))
      .then(ua => {
        this.usernames = ua.map(a => a.user);
        this.activities = {};
        for (const a of ua) {
          this.activities[a.user] = this.groomActivities(a);
        }

        const data = [];

        for (let i = 0; i < this.usernames.length; i++) {
          data.push({
            user: this.usernames[i],
            activities: this.getAllActivities(this.activities[this.usernames[i]]),
            color: google10c(i)
          });
        }

        this.ready = true;
        setTimeout(() => this.render(data));
      })
      .catch(e => this.ready = true);

    Promise
      .all(this.usernames.map(u => this.apiService.karma(u)))
      .then(k =>
        this.karma = ([].concat.apply([], k))
          .filter(d => d.from)
          .sort((a, b) => a.changed > b.changed ? -1 : 1))
      .catch(e => this.ready = true);
  }

  groomActivities(activities) {
    const groomActivity = activity => {
      activity.datetime = new Date(activity.created * 1000);
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0);
      activity.date = date;
      const time = new Date(1900, 0);
      time.setHours(activity.datetime.getHours(), activity.datetime.getMinutes());
      activity.time = time;
    };

    activities.posts.forEach(groomActivity);
    activities.comments.forEach(groomActivity);

    return activities;
  }

  getAllActivities(activities) {
    const data = activities.posts.slice();
    data.push(...activities.comments);
    return data;
  }

  async render(data: any[]): Promise<void> {
    // sizing
    const element = this.svgElement.nativeElement;
    const width = element.parentElement.clientWidth - 25;
    const height = Math.min(window.outerHeight - 290, width);
    element.setAttribute('width', width);
    element.setAttribute('height', height);

    // render
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 60
    };

    const svg = d3.select(this.svgElement.nativeElement);

    let all_activities = [];
    data.forEach(d => all_activities = all_activities.concat(d.activities));

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(all_activities, d => d.date), new Date()]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleTime()
      .domain(d3.extent(all_activities, d => d.time).reverse())
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(24, '%H:00'));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const opacity = .75;
    const radius = 1.25;

    data.forEach(user => {
      svg.append('g')
        .selectAll('circle')
        .data(user.activities)
        .enter()
        .append('circle')
        .attr('cx', d => x(d['date']))
        .attr('cy', d => y(d['time']))
        .attr('r', radius)
        .attr('opacity', opacity)
        .attr('fill', user.color);
    });

    element.setAttribute('class', 'chart');

    this.legends = this.usernames.map((u, i) => {
      return {
        username: u,
        color: google10c(i)
      };
    });
  }

  epochToDateTime(epoch: number) {
    return new Date(epoch * 1000).toISOString();
  }
}
