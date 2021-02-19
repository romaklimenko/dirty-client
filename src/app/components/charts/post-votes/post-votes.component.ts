import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Vote } from 'src/app/models/vote';
import { Post } from 'src/app/models/post';

@Component({
  selector: 'app-post-votes',
  templateUrl: './post-votes.component.html',
  styleUrls: ['./post-votes.component.css']
})
export class PostVotesComponent implements OnInit, AfterViewInit {

  @Input() username: string;
  @Input() votes: Vote[];
  @Input() post: Post;
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

    this.votes.sort((a, b) => a.changed > b.changed ? 1 : -1);

    for (let i = 0; i < this.votes.length; i++) {
      if (i === 0) {
        this.votes[i].rating = this.votes[i].vote;
        this.votes[i].clearRating = this.votes[i].vote > 0 ? 1 : -1;
        continue;
      }
      this.votes[i].rating = this.votes[i - 1].rating + this.votes[i].vote;
      this.votes[i].clearRating = this.votes[i - 1].clearRating + (this.votes[i].vote > 0 ? 1 : -1);
    }

    let maxDateX = d3.max(this.votes, d => d.datetime);
    if (this.post?.tops?.checkpoints) {
      const maxCheckpoint = new Date(d3.max(this.post.tops.checkpoints) as unknown as number * 1000);
      if (maxCheckpoint > maxDateX) {
        maxDateX = maxCheckpoint;
      }
    }

    const x = d3.scaleTime()
      .domain(d3.extent([new Date(this.post.created * 1000), maxDateX]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(
        d3.extent(
          [
            Math.min(d3.min(this.votes, d => d.rating), d3.min(this.votes, d => d.clearRating), 0),
            Math.max(0, d3.max(this.votes, d => d.rating), d3.max(this.votes, d => d.clearRating))]))
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
    const negative = '#FF5722';
    const tops = '#FF4081';

    const path = d3.line()
      .x(d => x(d['datetime']))
      .y(d => y(d['rating']))
      .curve(d3.curveMonotoneX);

    const clearPath = d3.line()
      .x(d => x(d['datetime']))
      .y(d => y(d['clearRating']))
      .curve(d3.curveMonotoneX);

    // clear rating
    svg
      .append('g')
      .append('path')
      .datum([
        {
          datetime: new Date(this.post.created * 1000),
          clearRating: 0
        } as unknown as Vote].concat(this.votes) as any)
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', '#919191')
      .attr('d', clearPath);

    svg.append('g')
      .selectAll('circle')
      .data(this.votes)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.datetime))
      .attr('cy', d => y(d.clearRating))
      .attr('fill', d => d.vote > 0 ? positive : negative)
      .attr('r', 1)
        .append('title')
          .text(d => `${d.user.login} - ${d.datetime}`);

    svg.append('g')
      .selectAll('line')
      .data(this.votes)
      .enter()
      .append('line')
      .attr('x1', d => x(d.datetime))
      .attr('x2', d => x(d.datetime))
      .attr('y1', d => y(d.clearRating))
      .attr('y2', d => y(0))
      .attr('stroke', d => d.vote > 0 ? positive : negative)
      .attr('stroke-width', .5)
      .attr('opacity', .3);

    // rating

    svg
      .append('g')
      .append('path')
      .datum([
        {
          datetime: new Date(this.post.created * 1000),
          rating: 0
        } as unknown as Vote].concat(this.votes) as any)
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', '#000')
      .attr('d', path);

    svg.append('g')
      .selectAll('circle')
      .data(this.votes)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.datetime))
      .attr('cy', d => y(d.rating))
      .attr('fill', d => d.vote > 0 ? positive : negative)
      .attr('r', d => Math.abs(d.vote) + .5)
        .append('title')
          .text(d => `${d.user.login} - ${d.datetime}`);

    svg.append('g')
      .selectAll('line')
      .data(this.votes)
      .enter()
      .append('line')
      .attr('x1', d => x(d.datetime))
      .attr('x2', d => x(d.datetime))
      .attr('y1', d => y(d.rating))
      .attr('y2', d => y(0))
      .attr('stroke', d => d.vote > 0 ? positive : negative)
      .attr('stroke-width', .5)
      .attr('opacity', .3);

    if (this.post?.tops) {
      this.post.tops.checkpoints.forEach(d => {
        svg
          .append('circle')
          .attr('cx', x(new Date(d * 1000)))
          .attr('cy', y(0))
          .attr('r', 3)
          .attr('fill', '#FFF')
          .attr('stroke', tops)
          .attr('stroke-width', 1.5)
            .append('title')
              .text(`${new Date(d * 1000)}`);
      });
    }
  }
}
