import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import { NotesPageComponent } from './components/pages/notes-page/notes-page.component';
import { UserCardComponent } from './components/cards/user-card/user-card.component';
import { DomainCardComponent } from './components/cards/domain-card/domain-card.component';
import { NotesCardComponent } from './components/cards/notes-card/notes-card.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { GreetingComponent } from './components/greeting/greeting.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HypnotoadComponent } from './components/hypnotoad/hypnotoad.component';
import { DomainPageComponent } from './components/pages/domain-page/domain-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { DomainPipe } from './pipes/domain.pipe';
import { UsersPageComponent } from './components/pages/users-page/users-page.component';
import { UserPageComponent } from './components/pages/user-page/user-page.component';
import { ActivitiesByTimeComponent } from './components/charts/activities-by-time/activities-by-time.component';
import { ActivitiesByDayComponent } from './components/charts/activities-by-day/activities-by-day.component';
import { SleepsComponent } from './components/charts/sleeps/sleeps.component';
import { CumulativeRatingComponent } from './components/charts/cumulative-rating/cumulative-rating.component';
import { KarmaComponent } from './components/charts/karma/karma.component';
import { TopActivitiesListComponent } from './components/top-activities-list/top-activities-list.component';
import { DomainsComponent } from './components/charts/domains/domains.component';
import { LoversAndHatersComponent } from './components/charts/lovers-and-haters/lovers-and-haters.component';
import { PostCardComponent } from './components/cards/post-card/post-card.component';
import { PostPageComponent } from './components/pages/post-page/post-page.component';
import { PostCommentsComponent } from './components/charts/post-comments/post-comments.component';
import { PostVotesComponent } from './components/charts/post-votes/post-votes.component';
import { UsernameComponent } from './components/inliners/username/username.component';
import { SockpuppetsPageComponent } from './components/pages/sockpuppets-page/sockpuppets-page.component';
import { GoldPageComponent } from './components/pages/gold-page/gold-page.component';
import { FeedbackPageComponent } from './components/pages/feedback-page/feedback-page.component';
import { HowItWorksComponent } from './components/blog/how-it-works/how-it-works.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { DuckComponent } from './components/blog/duck/duck.component';
import { NotesComponent } from './components/blog/notes/notes.component';
import { BotanComponent } from './components/blog/botan/botan.component';
import { InteresnoComponent } from './components/blog/interesno/interesno.component';
import { RulesPageComponent } from './components/pages/rules-page/rules-page.component';
import { CookieService } from 'ngx-cookie-service';
import { ReleaseNotesPageComponent } from './components/pages/release-notes-page/release-notes-page.component';
import { LoginComponent } from './components/blog/login/login.component';
import { ReadersComponent } from './components/charts/readers/readers.component';
import { DomainInfoComponent } from './components/charts/domain-info/domain-info.component';
import { DomainElectionsComponent } from './components/charts/domain-elections/domain-elections.component';
import { DomainVotersComponent } from './components/charts/domain-voters/domain-voters.component';
import { IndulgencesPageComponent } from './components/pages/indulgences-page/indulgences-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    NotesPageComponent,
    UserCardComponent,
    DomainCardComponent,
    NotesCardComponent,
    LoginPageComponent,
    GreetingComponent,
    HypnotoadComponent,
    DomainPageComponent,
    PageNotFoundComponent,
    DomainPipe,
    UsersPageComponent,
    UserPageComponent,
    ActivitiesByTimeComponent,
    ActivitiesByDayComponent,
    SleepsComponent,
    CumulativeRatingComponent,
    KarmaComponent,
    TopActivitiesListComponent,
    DomainsComponent,
  LoversAndHatersComponent,
    PostCardComponent,
    PostPageComponent,
    PostCommentsComponent,
    PostVotesComponent,
    UsernameComponent,
    SockpuppetsPageComponent,
    GoldPageComponent,
    FeedbackPageComponent,
    HowItWorksComponent,
    BlogListComponent,
    DuckComponent,
    NotesComponent,
    BotanComponent,
    InteresnoComponent,
    RulesPageComponent,
    ReleaseNotesPageComponent,
    LoginComponent,
    ReadersComponent,
    DomainInfoComponent,
    DomainElectionsComponent,
    DomainVotersComponent,
    IndulgencesPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
