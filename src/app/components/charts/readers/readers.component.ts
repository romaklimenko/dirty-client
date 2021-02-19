import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { google10c } from 'src/app/tools/google10c';

@Component({
  selector: 'app-readers',
  templateUrl: './readers.component.html',
  styleUrls: ['./readers.component.css']
})
export class ReadersComponent implements OnInit, AfterViewInit {

  @Input() prefix: string;
  @Input() width: number;
  @Input() readers: any[];

  @ViewChild('svgElementAllReaders') svgElementAllReaders: ElementRef;
  @ViewChild('svgElementLastReaders') svgElementLastReaders: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.renderReaders();
  }

  renderReaders(): Promise<void> {
    // sizing
    const elementAllReaders = this.svgElementAllReaders.nativeElement;
    const elementLastReaders = this.svgElementLastReaders.nativeElement;

    const height = Math.max(400, this.width / 16 * 6);

    elementAllReaders.setAttribute('width', this.width);
    elementAllReaders.setAttribute('height', height);
    elementLastReaders.setAttribute('width', this.width);
    elementLastReaders.setAttribute('height', height);

    if (!this.readers) {
      return;
    }

    const weekAgo = new Date(+new Date() - 7 * 86400 * 1000);
    const monthAgo = new Date(+new Date() - 30 * 86400 * 1000);
    const yearAgo = new Date(+new Date() - 365 * 86400 * 1000);

    const lastReaders = this.readers.filter(d => new Date(d._id.epoch * 1000) > monthAgo);

    // chart
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 60
    };

    const svgAllReaders = d3.select(elementAllReaders);
    const svgLastReaders = d3.select(elementLastReaders);

    const xAllReaders = d3.scaleTime()
      .domain(d3.extent(this.readers, d => new Date(d._id.epoch * 1000)))
      .range([margin.left, this.width - margin.right]);

    const xLastReaders = d3.scaleTime()
      .domain([new Date(+new Date() - 1000 * 60 * 60 * 24 * 30), new Date()])
      .range([margin.left, this.width - margin.right]);

    const minReadersCountAllReaders = d3.min(this.readers, d => d.readers_count);
    const maxReadersCountAllReaders = d3.max(this.readers, d => d.readers_count);

    const minReadersCountLastReaders = Math.max(0, d3.min(lastReaders, d => d.readers_count) - 10);
    const maxReadersCountLastReaders = d3.max(lastReaders, d => d.readers_count);

    const yAllReaders = d3.scaleLinear()
      .domain([minReadersCountAllReaders, maxReadersCountAllReaders])
      .range([height - margin.bottom, margin.top]);

    const yLastReaders = d3.scaleLinear()
      .domain([minReadersCountLastReaders, maxReadersCountLastReaders])
      .range([height - margin.bottom, margin.top]);

    const xAxisAllReaders = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xAllReaders));

    const xAxisLastReaders = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xLastReaders));

    const yAxisAllReaders = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yAllReaders));

    const yAxisLastReaders = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yLastReaders));

    svgAllReaders.append('g').call(xAxisAllReaders);
    svgAllReaders.append('g').call(yAxisAllReaders);

    const gAllReaders = svgAllReaders.append('g');
    const gLastReaders = svgLastReaders.append('g');

    const lineAllReaders = d3.line()
      .x(d => xAllReaders(new Date(d['_id']['epoch'] * 1000)))
      .y(d => yAllReaders(d['readers_count']))
      .curve(d3.curveMonotoneX);

    const lineLastReaders = d3.line()
      .x(d => xLastReaders(new Date(d['_id']['epoch'] * 1000)))
      .y(d => yLastReaders(d['readers_count']))
      .curve(d3.curveMonotoneX);

    gAllReaders.append('path')
      .datum(this.readers)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', google10c(0))
      .attr('d', lineAllReaders);

    gLastReaders.append('path')
      .datum(this.readers)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', google10c(0))
      .attr('d', lineLastReaders);

    // gLastReaders.append('rect')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', margin.left)
    //   .attr('height', height)
    //   .attr('fill', '#FFF');

    svgLastReaders.append('g').call(xAxisLastReaders);
    svgLastReaders.append('g').call(yAxisLastReaders);

    this.readers.forEach((d) => {
      gAllReaders.append('circle')
        .attr('cx', xAllReaders(new Date(d['_id']['epoch'] * 1000)))
        .attr('cy', yAllReaders(d['readers_count']))
        .attr('r', 3)
        .attr('stroke', google10c(0))
        .attr('fill', '#FFF')
          .append('title')
            .text(d['readers_count']);
    });

    this.readers.forEach((d) => {
      gLastReaders.append('circle')
        .attr('cx', xLastReaders(new Date(d['_id']['epoch'] * 1000)))
        .attr('cy', yLastReaders(d['readers_count']))
        .attr('r', 3)
        .attr('stroke', google10c(0))
        .attr('fill', '#FFF')
          .append('title')
            .text(d['readers_count']);
    });

    gAllReaders.append('line')
      .attr('x1', xAllReaders(weekAgo))
      .attr('x2', xAllReaders(weekAgo))
      .attr('y1', yAllReaders(minReadersCountAllReaders))
      .attr('y2', yAllReaders(maxReadersCountAllReaders))
      .attr('stroke', google10c(1))
      .attr('stroke-width', 1);

    gLastReaders.append('line')
      .attr('x1', xLastReaders(weekAgo))
      .attr('x2', xLastReaders(weekAgo))
      .attr('y1', yLastReaders(minReadersCountLastReaders))
      .attr('y2', yLastReaders(maxReadersCountLastReaders))
      .attr('stroke', google10c(1))
      .attr('stroke-width', 1);

    gAllReaders.append('line')
      .attr('x1', xAllReaders(monthAgo))
      .attr('x2', xAllReaders(monthAgo))
      .attr('y1', yAllReaders(minReadersCountAllReaders))
      .attr('y2', yAllReaders(maxReadersCountAllReaders))
      .attr('stroke', google10c(2))
      .attr('stroke-width', 1);

    gAllReaders.append('line')
      .attr('x1', xAllReaders(yearAgo))
      .attr('x2', xAllReaders(yearAgo))
      .attr('y1', yAllReaders(minReadersCountAllReaders))
      .attr('y2', yAllReaders(maxReadersCountAllReaders))
      .attr('stroke', google10c(3))
      .attr('stroke-width', 1);

    gLastReaders.append('line')
      .attr('x1', xLastReaders(yearAgo))
      .attr('x2', xLastReaders(yearAgo))
      .attr('y1', yLastReaders(minReadersCountLastReaders))
      .attr('y2', yLastReaders(maxReadersCountLastReaders))
      .attr('stroke', google10c(3))
      .attr('stroke-width', 1);
  }

}
