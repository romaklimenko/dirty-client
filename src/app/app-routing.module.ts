import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import { NotesPageComponent } from './components/pages/notes-page/notes-page.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { DomainPageComponent } from './components/pages/domain-page/domain-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { UserPageComponent } from './components/pages/user-page/user-page.component';
import { UsersPageComponent } from './components/pages/users-page/users-page.component';
import { PostPageComponent } from './components/pages/post-page/post-page.component';
import { SockpuppetsPageComponent } from './components/pages/sockpuppets-page/sockpuppets-page.component';
import { IndulgencesPageComponent } from './components/pages/indulgences-page/indulgences-page.component';
import { GoldPageComponent } from './components/pages/gold-page/gold-page.component';
import { FeedbackPageComponent } from './components/pages/feedback-page/feedback-page.component';
import { HowItWorksComponent } from './components/blog/how-it-works/how-it-works.component';
import { DuckComponent } from './components/blog/duck/duck.component';
import { NotesComponent } from './components/blog/notes/notes.component';
import { BotanComponent } from './components/blog/botan/botan.component';
import { InteresnoComponent } from './components/blog/interesno/interesno.component';
import { RulesPageComponent } from './components/pages/rules-page/rules-page.component';
import { BanGuard } from './guards/ban.guard';
import { ReleaseNotesPageComponent } from './components/pages/release-notes-page/release-notes-page.component';
import { LoginComponent } from './components/blog/login/login.component';

const routes: Routes = [
  { path: '', canActivateChild: [ BanGuard ], children:
    [
      { path: '', component: HomePageComponent },
      { path: 'notes', component: NotesPageComponent },
      { path: 'socks', component: SockpuppetsPageComponent },
      { path: 'amen', component: IndulgencesPageComponent },
      { path: 'domain/:domain', component: DomainPageComponent },
      { path: 'post/:post', component: PostPageComponent },
      { path: 'user/:user', component: UserPageComponent },
      { path: 'users/:users', component: UsersPageComponent },
      { path: 'gold', component: GoldPageComponent },
      { path: 'feedback', component: FeedbackPageComponent },

      // blog
      { path: 'blog/how-it-works', component: HowItWorksComponent },
      { path: 'blog/duck', component: DuckComponent },
      { path: 'blog/notes', component: NotesComponent },
      { path: 'blog/botan', component: BotanComponent },
      { path: 'blog/interesno', component: InteresnoComponent },
      { path: 'blog/login', component: LoginComponent },
    ]
  },

  { path: 'welcome', component: RulesPageComponent },
  { path: 'release-notes', component: ReleaseNotesPageComponent },

  { path: 'login', component: LoginPageComponent },

  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
