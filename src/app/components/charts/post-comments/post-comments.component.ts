import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Comment } from '../../../models/comment';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.css']
})
export class PostCommentsComponent implements OnInit, AfterViewInit {

  @Input() username: string;
  @Input() comments: Comment[];
  @Input() width: number;

  @ViewChild('svgElement') svgElement: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    // sizing
    const element = this.svgElement.nativeElement;
    const width = this.width - 25;
    const height = Math.max(400, width / 16 * 4);
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

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(this.comments, d => d.datetime), d3.max(this.comments, d => d.datetime)]))
      .range([margin.left, width - margin.right]);

    const range = Math.max(-d3.min(this.comments, d => d.rating), d3.max(this.comments, d => d.rating));

    const y = d3.scaleLinear()
      .domain(d3.extent([-range, +range]))
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
      .data(this.comments)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.datetime))
      .attr('cy', d => y(d.rating))
      .attr('fill', d => d.rating > 0 ? positive : (d.rating < 0 ? negative : neutral))
      .attr('opacity', .75)
      .attr('r', 2)
        .append('title')
          .text(d => d.user.login);
  }

}
