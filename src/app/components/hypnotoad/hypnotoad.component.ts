import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hypnotoad',
  templateUrl: './hypnotoad.component.html',
  styleUrls: ['./hypnotoad.component.css']
})
export class HypnotoadComponent implements OnInit, OnDestroy {

  seconds = 0;
  intervalId;

  constructor() { }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.seconds++;
      console.log('hypnotoad', this.seconds);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}
