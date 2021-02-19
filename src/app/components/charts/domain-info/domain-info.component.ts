import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { google10c } from 'src/app/tools/google10c';

@Component({
  selector: 'app-domain-info',
  templateUrl: './domain-info.component.html',
  styleUrls: ['./domain-info.component.css']
})
export class DomainInfoComponent implements OnInit, AfterViewInit {

  @Input() width: number;
  @Input() domain: any;
  @ViewChild('svgElementLeaders') svgElementLeaders: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.renderLeaders();
  }

  renderLeaders() {
    // sizing
    const element = this.svgElementLeaders.nativeElement;
    const height = 250;
    element.setAttribute('width', this.width);
    element.setAttribute('height', height);

    // chart
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 120
    };

    const svg = d3.select(element);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.domain.domain_leaders, d => d['rating'] as number)])
      .range([margin.left, this.width - margin.right]);

    const y = d3.scaleBand()
      .domain(this.domain.domain_leaders.map(d => d.login).reverse())
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

    this.domain.domain_leaders.forEach((d, i) => {
      g.append('line') // <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
        .attr('x1', x(0))
        .attr('x2', x(d.rating))
        .attr('y1', y(d.login) + y.bandwidth() / 2)
        .attr('y2', y(d.login) + y.bandwidth() / 2)
        .attr('stroke', google10c(0))
        .attr('stroke-width', 15)
          .append('title')
            .text(d['rating'])
    });
  }

}
