import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as d3 from 'd3';
import { google10c } from 'src/app/tools/google10c';

@Component({
  selector: 'app-domain-elections',
  templateUrl: './domain-elections.component.html',
  styleUrls: ['./domain-elections.component.css']
})
export class DomainElectionsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() prefix: string;
  @Input() width: number;

  @ViewChild('svgElementElections') svgElementElections: ElementRef;

  legends: any[];

  lastVote: Date;

  lastUpdate: Date;

  votes: any[];

  timeoutId;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.renderElections();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  async renderElections(self?: DomainElectionsComponent): Promise<void> {
    if (!self) {
      self = this;
    }
    // sizing
    const element = self.svgElementElections.nativeElement;
    const height = Math.max(400, this.width / 16 * 6);
    element.setAttribute('width', this.width);
    element.setAttribute('height', height);

    // data
    self.votes = await self.apiService.electionVotes(self.prefix);

    if (self.votes.length === 0) {
      return;
    }

    // chart
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 40
    };

    const data = { };

    self.votes.forEach(d => {
      const vote = {
        created_at: new Date(d.created_at * 1000),
        vote: d.vote,
        from: d.from
      };
      if (data[d.to] === undefined) {
        data[d.to] = [vote];
      } else {
        data[d.to].push(vote);
      }
    });

    element.innerHTML = '';

    const svg = d3.select(element);

    const x = d3.scaleTime()
      .domain(d3.extent(self.votes, d => new Date(d.created_at * 1000)))
      .range([margin.left, this.width - margin.right]);

    const y = d3.scaleLinear()
      .domain([1, d3.max(self.votes, d => d.vote)])
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const g = svg.append('g');

    const line = d3.line()
      .x(d => x(d['created_at']))
      .y(d => y(d['vote']))
      .curve(d3.curveMonotoneX);

    if (self.votes.length > 0 &&
      self.votes[0].created_at >= (Math.floor(new Date().getTime() / 1000.0) - 86400)) {
      self.timeoutId = setTimeout(() => self.renderElections(self), 5 * 1000);
    }

    Object.keys(data).forEach((d, i) => {
      g.append('path')
        .datum(data[d])
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', google10c(i))
        .attr('d', line);

      data[d].forEach((_d, _i) => {
        g.append('circle')
          .attr('cx', x(_d.created_at))
          .attr('cy', y(_d.vote))
          .attr('r', 3)
          .attr('stroke', google10c(i))
          .attr('fill', '#FFF')
            .append('title')
              .text(_d.from + ' проголосовал за ' + d + ' ' + _d.created_at);
      });
    });

    this.renderLegend(self.votes);

    self.lastVote = new Date(self.votes[self.votes.length - 1].created_at * 1000);
    self.lastUpdate = new Date();
  }

  renderLegend(votes: any[]): void {
    const result = [];
    const set = new Set();

    votes.forEach(vote => set.add(vote.to));
    let i = 0;
    set.forEach(vote => {
      result.push({
        color: google10c(i),
        username: vote
      });
      i++;
    });
    this.legends = result;
  }

}
