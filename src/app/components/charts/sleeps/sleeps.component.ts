import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Activity } from 'src/app/models/activity';
import { ApiService } from 'src/app/services/api.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-sleeps',
  templateUrl: './sleeps.component.html',
  styleUrls: ['./sleeps.component.css']
})
export class SleepsComponent implements OnInit, AfterViewInit {

  @Input() allActivities: Activity[];
  @Input() width: number;
  @Input() username: string;

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

    const data = [...this.allActivities];
    data.sort((a, b) => a.created > b.created ? 1 : -1);

    const _24h = 1000 * 60 * 60 * 24;
    const sleeps = [];

    const byDate = { };

    const push = (key, record) => {
      if (byDate[key]) {
        byDate[key].push(record);
      } else {
        byDate[key] = [record];
      }
    };

    data.forEach((d, i) => {
      if (i === 0) { return; }

      const keyStart = new Date(data[i - 1].date).toISOString();
      const keyEnd = new Date(d.date).toISOString();
      const start = new Date(data[i - 1].created * 1000);
      const end = new Date(d.created * 1000);
      const distance = i < data.length - 1 ?
        +new Date(d.created * 1000) - +new Date(data[i - 1].created * 1000) : _24h * 2;

      const record = {
        start,
        end,
        distance,
        hours: distance / 1000 / 60 / 60
      };

      push(keyStart, record);
      push(keyEnd, record);
    });

    const keys = Object.keys(byDate);

    const findMaxRecord = (records) => {
      let record = null;
      for (let i = 0; i < records.length; i++) {
        if (!record || record.distance < records[i].distance) {
          record = records[i];
        }
      }
      return record;
    };

    const maxSpans = [];

    for (let i = 0; i < keys.length; i++) {
      let record = findMaxRecord(byDate[keys[i]]);
      if (record.distance < _24h) {
        maxSpans.push(record);
      }
    }

    maxSpans.forEach((d, i) => {
      if (i === 0 || d.start - maxSpans[i - 1].start !== 0) {
        if (d.start.toDateString() !== d.end.toDateString()) {
          sleeps.push({
            start: d.start,
            end: new Date(new Date(d.start).setHours(23, 59, 59, 0)),
            distance: d.distance,
            hours: d.hours
          });
          sleeps.push({
            start: new Date(new Date(d.end).setHours(0, 0, 0, 0)),
            end: d.end,
            distance: d.distance,
            hours: d.hours
          });
        } else {
          sleeps.push(d);
        }
      }
    });

    const x = d3.scaleTime()
      .domain(d3.extent([d3.min(data, d => d.datetime), new Date()]))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleTime()
      .domain(d3.extent([new Date(1900, 0, 1, 0, 0, 0), new Date(1900, 0, 1, 23, 59, 59)]).reverse())
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(24, '%H:00'));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    const positive = '#B0BEC5';
    const neutral = '#FF9800';
    const negative = '#FF5722';

    svg.append('g')
      .selectAll('line')
      .data(sleeps.sort((a, b) => a.hours > b.hours ? -1 : 1))
      .enter()
      .append('line')
      .attr('x1', d => x(d.end))
      .attr('y1', d => {
        const start = new Date(d.start);
        start.setFullYear(1900, 0, 1);
        return y(new Date(start));
      })
      .attr('x2', d => x(d.end))
      .attr('y2', d => {
        const end = new Date(d.end);
        end.setFullYear(1900, 0, 1);
        return y(new Date(end));
      })
      .attr('stroke', d => d.hours > 8 ? positive : (d.hours < 6 ? negative : neutral))
      .attr('stroke-width', d => d.hours > 8 ? 0.7 : (d.hours < 6 ? 2 : 1.5));
  }

}
