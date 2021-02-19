import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Activity } from 'src/app/models/activity';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cumulative-rating',
  templateUrl: './cumulative-rating.component.html',
  styleUrls: ['./cumulative-rating.component.css']
})
export class CumulativeRatingComponent implements OnInit, AfterViewInit {

  @Input() username: string;
  @Input() allActivities: Activity[];
  @Input() width: number;

  @ViewChild('svgElement') svgElement: ElementRef;

  constructor(public apiService: ApiService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
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

    const svg = d3.select(this.svgElement.nativeElement);

    const data = this.allActivities
      .sort((a, b) => a.created > b.created ? 1 : -1)
      .map(a => Object.assign({ }, a));

    data.forEach((d, i) => {
      if (i === 0) {
        d['cumulativeRating'] = d.rating;
      }
      else {
        d['cumulativeRating'] = data[i - 1]['cumulativeRating'] + d.rating;
      }
    });

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(data, d => d.datetime), new Date()]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent([Math.min(0, d3.min(data, d => d['cumulativeRating'])), Math.max(d3.max(data, d => d['cumulativeRating']))]))
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${y(0)})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const positive = '#00C853';
    const neutral = '#757575';
    const negative = '#FF5722';

    svg.append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.datetime))
      .attr('cy', d => y(d['cumulativeRating']))
      .attr('fill', d => d.rating > 0 ? positive : (d.rating < 0 ? negative : neutral))
      .attr('r', d => d.rating === 0 ? 1 : 1.5);
  }
}
