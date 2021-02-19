import { Component, OnInit, Input } from '@angular/core';

import { sockpuppets } from '../../../data/sockpuppets';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.css']
})
export class UsernameComponent implements OnInit {

  @Input() username: string;
  @Input() outer = false;
  @Input() renderSockpuppets = true;
  sockpuppets: {} = null;

  constructor() { }

  ngOnInit(): void {
    if (this.username.toLowerCase() in sockpuppets) {
      this.sockpuppets = sockpuppets[this.username.toLowerCase()];
    }
  }
}
