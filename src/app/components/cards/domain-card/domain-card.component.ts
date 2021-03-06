import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { declension } from 'src/app/tools/declension';

@Component({
  selector: 'app-domain-card',
  templateUrl: './domain-card.component.html',
  styleUrls: ['./domain-card.component.css']
})
export class DomainCardComponent implements OnInit {
  domainForm = new FormGroup({
    domain: new FormControl('', Validators.required)
  });

  elections: Set<any> = new Set();

  domains: [];

  constructor(
    public router: Router,
    public apiService: ApiService) { }

  ngOnInit() {
    this.apiService.electionVotes()
      .then(response => {
        this.elections = new Set();

        const now = Math.floor(new Date().getTime() / 1000.0);

        for (const vote of response['votes']) {
          if (vote['created_at'] >= now - 86400) {
            this.elections.add(vote['domain']['url'].replace('.d3.ru', ''));
          }
        }
      });
  }

  submit() {
    this.router.navigateByUrl(`/domain/${this.domainForm.value.domain}`);
  }

  epochToDate(epoch: number) {
    return new Date(epoch * 1000).toLocaleDateString();
  }

  color(n: number) {
    if (n > 32) {
      return '#1B5E20';
    }
    else if (n > 16) {
      return '#2E7D32';
    }
    else if (n > 8) {
      return '#388E3C';
    }
    else if (n > 4) {
      return '#43A047';
    }
    else if (n > 2) {
      return '#4CAF50';
    }
    else if (n > 1) {
      return '#66BB6A';
    }
    else if (n > .5) {
      return '#81C784';
    }
    else if (n > .25) {
      return '#A5D6A7';
    }
    else if (n > .125) {
      return '#C8E6C9';
    }
    else if (n > 0) {
      return '#E8F5E9';
    }
    else if (n > -.125) {
      return '#FFEBEE';
    }
    else if (n > -.25) {
      return '#FFCDD2';
    }
    else if (n > -.5) {
      return '#EF9A9A';
    }
    else if (n > -1) {
      return '#E57373';
    }
    else if (n > -2) {
      return '#EF5350';
    }
    else if (n > -4) {
      return '#F44336';
    }
    else if (n > -8) {
      return '#E53935';
    }
    else if (n > -16) {
      return '#D32F2F';
    }
    else if (n > -32) {
      return '#C62828';
    }
    else {
      return '#B71C1C';
    }
  }
}
