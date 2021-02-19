import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-release-notes-page',
  templateUrl: './release-notes-page.component.html',
  styleUrls: ['./release-notes-page.component.css']
})
export class ReleaseNotesPageComponent implements OnInit {

  constructor(public apiService: ApiService) { }

  ngOnInit(): void {
  }

}
