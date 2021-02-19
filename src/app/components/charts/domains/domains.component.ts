import { Activity } from 'src/app/models/activity';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit, AfterViewInit {

  @Input() allActivities: Activity[];
  @Input() width: number;

  @ViewChild('svgElement') svgElement: ElementRef;

  ratings: any[] = [];

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    const data = this.allActivities.map(d => Object.assign({}, d));

    // table

    const ratingObj = { };

    data.forEach(a => {
      if (ratingObj[a.domain]) {
        ratingObj[a.domain].rating += a.rating;
        ratingObj[a.domain].count++;
        if (a['post_id']) {
          ratingObj[a.domain].preferencesRating += 1;
        } else {
          ratingObj[a.domain].preferencesRating += 10;
        }
      } else {
        ratingObj[a.domain] = {
          rating: a.rating,
          positiveRating: 0,
          negativeRating: 0,
          count: 1,
          preferencesRating: a['post_id'] ? 1 : 10
        };
      }
      if (a.rating > 0) {
        ratingObj[a.domain].positiveRating += a.rating;
      } else if (a.rating < 0) {
        ratingObj[a.domain].negativeRating += a.rating;
      }
    });

    Object.keys(ratingObj)
      .map(key => {
        return {
          domain: key,
          rating: ratingObj[key].rating,
          positiveRating: ratingObj[key].positiveRating,
          negativeRating: ratingObj[key].negativeRating,
          count: ratingObj[key].count,
          preferencesRating: ratingObj[key].preferencesRating
        };
      })
      .sort((a, b) => {
        return a.rating > b.rating ? -1 : 1
      })
      .forEach(d => {
        const domainUrl = d.domain === '' ? 'https://d3.ru' : `https://${d.domain}.d3.ru/`;
        const domainName = d.domain === '' ? 'd3' : `${d.domain}`;
        this.ratings.push({
          domainUrl,
          domainName,
          count: d.count,
          rating: d.rating,
          positiveRating: d.positiveRating,
          negativeRating: d.negativeRating,
          mean: (Math.floor((d.rating / d.count) * 100) / 100).toFixed(2),
          preferencesRating: d.preferencesRating
        });
      });

    // sizing
    const element = this.svgElement.nativeElement;
    const width = this.width - 25;
    const height = Math.max(400, width / 16 * 7);
    element.setAttribute('width', width);
    element.setAttribute('height', height);

    // chart
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 60
    };

    const svg = d3.select(this.svgElement.nativeElement);

    const x = d3.scaleBand()
      .domain(this.ratings.map(d => d.domainName))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(this.ratings, d => d.negativeRating), d3.max(this.ratings, d => d.positiveRating)])
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .call(g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)));

    const g = svg.append('g');

    for (const d of this.ratings) {
      g.append('line')
        .attr('x1', x(d.domainName) + x.bandwidth() / 2)
        .attr('x2', x(d.domainName) + x.bandwidth() / 2)
        .attr('y1', y(0))
        .attr('y2', y(d.positiveRating))
        .attr('stroke', '#00C853')
        .attr('stroke-width', x.bandwidth() / 2)
          .append('title')
            .text(`${d.domainName}: +${d.positiveRating}/${d.negativeRating}`);

      g.append('line')
        .attr('x1', x(d.domainName) + x.bandwidth() / 2)
        .attr('x2', x(d.domainName) + x.bandwidth() / 2)
        .attr('y1', y(0))
        .attr('y2', y(d.negativeRating))
        .attr('stroke', '#FF5722')
        .attr('stroke-width', x.bandwidth() / 2)
          .append('title')
            .text(`${d.domainName}: +${d.positiveRating}/${d.negativeRating}`);

      g.append('line')
        .attr('x1', x(d.domainName) + x.bandwidth() / 4)
        .attr('x2', x(d.domainName) + x.bandwidth() / 4 * 3 )
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', d.negativeRating > d.positiveRating ? '#FF5722' : '#00C853')
        .attr('stroke-width', 1);

    }
  }
}
