import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit {

  constructor(public apiService: ApiService) { }

  error = '';

  notes: any [];

  ready = false;

  ngOnInit() {
    this.apiService.pruneLocalCache();

    if (this.apiService.anonymous) {
      this.ready = true;
      return;
    }

    this.apiService.notes()
      .then(value => {
        this.notes = value;
        this.ready = true;
        this.authors();
      })
      .catch(e => {
        this.ready = true;
        if (e.status === 400) {
          this.error = 'Похоже, что вы недостаточно золотой для просмотра заметок о себе.';
        } else {
          console.error(e);
        }
      });
  }

  async authors() {
    const karma = await this.apiService.karma(this.apiService.session.user.login);
    karma.sort((a, b) => a.changed > b.changed ? 1 : -1);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < karma.length; i++) {
      const vote = karma[i];
      if (vote.user.deleted) {
        continue;
      }
      const authorNote = await this.apiService.note(vote.user.login);
      if (authorNote) {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.notes.length; j++) {
          const note = this.notes[j];
          if (note.id === authorNote.id) {
            if (!vote.from) {
              note.vote = vote.vote;
              note.vote_changed = vote.changed;
            }
            note.author = vote.user.login;
            continue;
          }
        }
      }
    }
  }

  epochToString(epoch: number): string {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
