import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Activity } from 'src/app/models/activity';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-activities-by-day',
  templateUrl: './activities-by-day.component.html',
  styleUrls: ['./activities-by-day.component.css']
})
export class ActivitiesByDayComponent implements OnInit, AfterViewInit {

  @Input() allActivities: Activity[];
  @Input() width: number;
  @Input() username: string;

  @ViewChild('svgElement') svgElement: ElementRef;

  windowSize = 30;

  windowMean: number;

  topRecords: any[] = [];

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

    const dict = {};

    this.allActivities.forEach(a => {
      const key = a.date.toISOString();
      if (dict[key]) {
        dict[key].count++;
        dict[key].from = Math.min(dict[key].from, a.created);
        dict[key].to = Math.max(dict[key].to, a.created);
      } else {
        dict[key] = {
          date: a.date,
          count: 1,
          from: a.created,
          to: a.created
        }
      }
    });

    const data = Object.keys(dict).map(key => dict[key]);

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(data, d => d.date), new Date()]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent([0, d3.max(data, d => d.count)]))
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const yAxisRight = g => g
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(y));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg.append('g').call(yAxisRight);

    svg.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', d => x(d.date))
      .attr('y1', d => y(d.count))
      .attr('x2', d => x(d.date))
      .attr('y2', d => y(0))
      .attr('stroke', d => (d.date.getDay() === 0 || d.date.getDay() === 6) ? 'red' : 'black')
      .attr('stroke-width', 1)
      .attr('opacity', .5);

    const top = data.map(d => d).sort((a, b) => a.count > b.count ? -1 : 1).slice(0, 10);
    top.forEach(d => {
      this.topRecords.push({
        date: d.date.toLocaleDateString(),
        count: d.count,
        link: `https://d3.ru/search/?author=${this.username}&date_start=${d.from - 1000}&date_end=${d.to + 1000}&sort=date&include_adult=on`
      });
    });

    // trendline
    const minCreatedDate = new Date(d3.min(this.allActivities, d => d.created) * 1000);
    minCreatedDate.setHours(0, 0, 0, 0);
    const minCreated = Math.floor(minCreatedDate.getTime() / 1000);
    const nowCreated = Math.floor(new Date().getTime() / 1000);
    let currentCreated = minCreated;

    while (currentCreated <= nowCreated) {
      const date = new Date(currentCreated * 1000);
      date.setHours(0, 0, 0, 0)
      const key = date.toISOString()
      if (!dict[key]) {
        dict[key] = {
          date,
          count: 0
        }
      }
      currentCreated += 86400;
    }

    const filledData = Object.keys(dict)
      .map(key => dict[key])
      .sort((a, b) => a.date > b.date ? 1 : -1);

    // это место очевидно можно ускорить
    filledData.forEach((day, i) => {
      const from = Math.max(0, i - this.windowSize + 1);
      const to = from + Math.min(i + 1, this.windowSize);
      const localWindow = filledData.slice(from, to);
      day.mean = d3.sum(localWindow, d => d.count) / this.windowSize;
    });

    const line = d3.line()
      .x(d => x(d['date']))
      .y(d => y(d['mean']))
      .curve(d3.curveMonotoneX);

    svg
      .append('g')
      .append('path')
      .datum(filledData)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', 'red')
      .attr('d', line);

    setTimeout(() => {
      // https://github.com/angular/angular/issues/6005
      this.windowMean = filledData[filledData.length - 1].mean;
    });
  }

}
