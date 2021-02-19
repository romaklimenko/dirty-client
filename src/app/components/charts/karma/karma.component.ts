import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { ApiService } from 'src/app/services/api.service';
import { KarmaVote } from 'src/app/models/karma-vote';
import { epochToDateTime } from 'src/app/tools/epochToDateTime';

@Component({
  selector: 'app-karma',
  templateUrl: './karma.component.html',
  styleUrls: ['./karma.component.css']
})
export class KarmaComponent implements OnInit, AfterViewInit {

  @Input() karma: KarmaVote[];
  @Input() width: number;
  @Input() username: string;

  @ViewChild('svgElement') svgElement: ElementRef;

  log: any[] = [];

  sumInUp = 0;
  sumInDown = 0;
  sumIn = 0;

  sumOutUp = 0;
  sumOutDown = 0;
  sumOut = 0;

  constructor(public apiService: ApiService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.render().then(() => this.notes());
    }, 0);
  }

  async render(): Promise<void> {
    // sizing
    const element = this.svgElement.nativeElement;
    const width = this.width - 25;
    const height = Math.max(400, width / 16 * 7);
    element.setAttribute('width', width);
    element.setAttribute('height', height);

    // render
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 60
    };

    const data = this.karma.filter(k => !k.from);

    const svg = d3.select(this.svgElement.nativeElement);

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(data, d => epochToDateTime(d.changed)), new Date()]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.karma))
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    svg.append('line')
      .attr('x1', x(d3.min(data, d => epochToDateTime(d.changed))))
      .attr('x2', x(d3.max(data, d => epochToDateTime(d.changed))))
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#000')
      .attr('stroke-width', .75);

    svg.append('g')
      .selectAll('circle')
      .data(data.filter(d => d.user.login === 'dirty'))
      .enter()
      .append('circle')
      .attr('cx', d => x(epochToDateTime(d.changed)))
      .attr('cy', d => y(d.karma))
      .attr('fill', '#FFAB00')
      .attr('r', 9);

    svg.append('g')
      .selectAll('image')
      .data(data.filter(d => d.user.login === 'dirty'))
      .enter()
      .append('image')
      .attr('href', 'assets/images/logo_main_retina.png')
      .attr('x', d => x(epochToDateTime(d.changed)) - 24)
      .attr('y', d => y(d.karma) - 24)
      .attr('heigth', '48px')
      .attr('width', '48px');

    const positive = '#00C853';
    const negative = '#FF5722';

    svg.append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(epochToDateTime(d.changed)))
      .attr('cy', d => y(d.karma))
      .attr('fill', d => d.vote > 0 ? positive : negative)
      .attr('r', d => Math.abs(d.vote) === 1 ? 1 : 1.5);

    const byDate = {};

    for (let i = this.karma.length; i--;) {
      const vote = this.karma[i];
      const key = epochToDateTime(vote.changed).toLocaleDateString();

      if (byDate[key] === undefined) {
        if (vote.from) {
          if (!vote.deleted) {
            if (vote.vote > 0) {
              this.sumOutUp += vote.vote;
            }
            else {
              this.sumOutDown += vote.vote;
            }
            this.sumOut += vote.vote;
          }

          byDate[key] = {
            votes: [vote],
            upIn: 0,
            downIn: 0,
            upOut: Math.max(0, vote.vote),
            downOut: Math.min(vote.vote, 0),
          };
        }
        else {
          if (vote.vote > 0) {
            this.sumInUp += vote.vote;
          }
          else {
            this.sumInDown += vote.vote;
          }
          this.sumIn += vote.vote;

          byDate[key] = {
            votes: [vote],
            upIn: Math.max(0, vote.vote),
            downIn: Math.min(vote.vote, 0),
            upOut: 0,
            downOut: 0,
          };
        }
      } else {
        byDate[key].votes.push(vote);

        if (vote.from) {
          if (!vote.deleted) {
            if (vote.vote > 0) {
              this.sumOutUp += vote.vote;
            }
            else {
              this.sumOutDown += vote.vote;
            }
            this.sumOut += vote.vote;
          }

          byDate[key].upOut += Math.max(0, vote.vote);
          byDate[key].downOut += Math.min(vote.vote, 0);
        }
        else {
          if (vote.vote > 0) {
            this.sumInUp += vote.vote;
          }
          else {
            this.sumInDown += vote.vote;
          }
          this.sumIn += vote.vote;

          byDate[key].upIn += Math.max(0, vote.vote);
          byDate[key].downIn += Math.min(vote.vote, 0);
        }
      }
    }

    const keys = Object.keys(byDate);

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const date = byDate[key];
      const deltaIn = date.upIn + date.downIn;
      const deltaOut = date.upOut + date.downOut;

      const header = {
        // tslint:disable-next-line: max-line-length
        href: `https://d3.ru/search/?author=${this.username}&date_start=${date.votes[0].changed - 86400 * 3}&date_end=${date.votes[0].changed + 86400}&sort=date&include_adult=on`,
        date,
        deltaIn,
        deltaOut,
        rows: [],
        key
      };

      // for (let j = 0; j < date.votes.length; j++) {
      for (const vote of date.votes) {
        vote.time = epochToDateTime(vote.changed).toLocaleTimeString();

        header.rows.push({
          vote
        });
      }

      this.log.push(header);
    }
  }

  async notes() {
    if (this.username.toLowerCase() !== this.apiService.session.user?.login?.toLowerCase()) {
      return;
    }

    for (const day of this.log) {
      for (const v of day.rows.filter(v => !v.vote.user?.deleted)) {
        try {
          v.vote.note = await this.apiService.note(v.vote.user.login);
        } catch (e) {
          if (e.status === 400) {
            console.error('Недостаточно золотой', e);
            break;
          } else {
            console.error(e);
          }
        }
      }
    }
  }
}
