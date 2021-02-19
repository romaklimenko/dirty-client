import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { ApiService } from 'src/app/services/api.service';
import { VotersResponse } from 'src/app/models/voters-response';
import { sockpuppets } from '../../../data/sockpuppets';

@Component({
  selector: 'app-lovers-and-haters',
  templateUrl: './lovers-and-haters.component.html',
  styleUrls: ['./lovers-and-haters.component.css']
})
export class LoversAndHatersComponent implements OnInit, AfterViewInit {

  @Input() username: string;
  @Input() voters: VotersResponse;
  @Input() width: number;

  @ViewChild('svgElement') svgElement: ElementRef;

  constructor(public apiService: ApiService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    // sizing
    const element = this.svgElement.nativeElement;
    const width = this.width - 25;

    // render
    const margin = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    };

    const svg = d3.select(this.svgElement.nativeElement);

    const allVoters = [];

    this.voters.top_lovers.forEach(v => allVoters.push(v))
    this.voters.top_haters.forEach(v => allVoters.push(v))

    const rowHeight = 20;

    const height = (this.voters.top_lovers.length + this.voters.top_haters.length)
      * rowHeight + margin.top + margin.bottom;

    element.setAttribute('width', width);
    element.setAttribute('height', height);

    const deviation = d3.max([
      d3.max(this.voters.top_lovers, d => d3.max([d.pros, -d.cons])),
      d3.max(this.voters.top_haters, d => d3.max([d.pros, -d.cons])),
    ]);

    const x = d3.scaleLinear()
      .domain([-deviation, deviation])
      .range([margin.left, width - margin.right]);

    const key = d => {
      let virtual = '';
      if (d.voter.toLowerCase() in sockpuppets) {
        // tslint:disable-next-line: quotemark
        virtual = ` (виртуал ${sockpuppets[d.voter.toLowerCase()].join(", ")})`;
      }
      return `${d.voter}${virtual} (+${d.pros}/${d.cons})`;
    };

    const y = d3.scaleBand()
      .domain(allVoters.map(key).reverse())
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg.append('g').call(xAxis);

    const g = svg.append('g');

    const render = (d) => {
      const strokeWidth =  rowHeight * .75;

      g.append('line') // <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
        .attr('x1', x(0))
        .attr('x2', x(d.pros))
        .attr('y1', y(key(d)) + y.bandwidth() / 2)
        .attr('y2', y(key(d)) + y.bandwidth() / 2)
        .attr('stroke', '#00C853')
        .attr('stroke-width', strokeWidth);

      g.append('line') // <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
        .attr('x1', x(d.cons))
        .attr('x2', x(0))
        .attr('y1', y(key(d)) + y.bandwidth() / 2)
        .attr('y2', y(key(d)) + y.bandwidth() / 2)
        .attr('stroke', '#FF5722')
        .attr('stroke-width', strokeWidth);
    };

    this.voters.top_lovers.forEach(d => {
      render(d);
    });

    this.voters.top_haters.forEach(d => {
      render(d);
    });

    svg.append('g')
      .call(g => g
        .attr('transform', `translate(${x(-deviation)},0)`)
        .call(d3.axisRight(y)));

    svg.append('g')
      .call(g => g
        .attr('transform', `translate(${x(deviation)},0)`)
        .call(d3.axisLeft(y)));

    svg.selectAll('.tick').on('click', (d: string) => {
      window.open(`https://d3.ru/user/${d.substring(0, d.indexOf(' ('))}`);
    })
  }
}
