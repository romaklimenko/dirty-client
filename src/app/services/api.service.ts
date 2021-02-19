import { Injectable } from '@angular/core';
import { Session } from '../models/session';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { random } from '../tools/random';
import { v4 as uuid } from 'uuid';
import { ActivitiesResponse } from '../models/activities-response';
import { KarmaVote } from '../models/karma-vote';
import { VotersResponse } from '../models/voters-response';
import { Activity } from '../models/activity';
import { Vote } from '../models/vote';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  private sessionKey = 'session';

  // X-Client-Key
  private clientFingerprintKey = 'ck';
  // X-Session-Key
  private sessionFingerprintKey = 'sk';

  public pruneThreshold = 512;

  async fetchJson(groupName: string, input: RequestInfo, init?: RequestInit) {
    console.groupCollapsed(`🐤 ${groupName}`);
    console.info('Отправка запроса', input, init);
    console.groupEnd();
    const t0 = performance.now();
    const response = await fetch(input, init);
    if (!response.ok) {
      const error = {
        status: response.status,
        statusText: response.statusText
      };
      const t1 = performance.now();
      console.group(`❌ ${groupName}`);
      console.info('Запрос', input, init);
      console.error('Ошибка', error);
      console.info('Время', t1 - t0, 'мс.');
      console.groupEnd();
      return Promise.reject(error);
    }
    const json = await response.json();
    const t1 = performance.now();
    console.groupCollapsed(`✅ ${groupName}`);
    console.info('Запрос', input, init);
    console.info('Ответ', json);
    console.info('Время', t1 - t0, 'мс.') 
    console.groupEnd();
    return json;
  }

  async login(username: string, password: string): Promise<Session> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    const body = JSON.stringify({
      username,
      password
    });

    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        'Content-Type':  'application/json'
      }
    }

    this.session = await this.fetchJson(`Вход с аккаунтом d3.ru`, 'https://d3.ru/api/auth/login/', init);
    return this.session;
  }

  async keepalive(url: string): Promise<void> {
    try {
      const headers = this.fingerprintHeaders;
      headers['Content-Type'] = 'application/json';
      fetch(`${environment.apiUrl}/keepalive${url}`, {
        method: 'GET',
        headers
      });
      window.keepalive(url);
    } catch (error) {
      console.error(error);
    }
  }

  async karma(username: string): Promise<KarmaVote[]> {
    return await this.fetchJson(`Карма ${username}`, `${environment.apiUrl}/users/${username}/karma/`, {
      method: 'GET',
      headers: this.fingerprintHeaders
    });
  }

  async notes(): Promise<any[]> {
    if (this.anonymous) {
      return [];
    }

    const notes = [];
    let page = 1;
    let pageCount = 1;

    const params = {
      method: 'GET',
      headers: this.d3SessionHeaders
    };

    while (page <= pageCount) {
      const result: any = await this.fetchJson(
        `Заметки в профиле ${this.session.user.login}, страница ${page}`,
        `https://d3.ru/api/user_notes/?user_login=${this.session.user.login}&page=${page}`, params);

      if (result === null) {
        return [];
      }

      if (result.page_count) {
        pageCount = result.page_count;
      }

      if (result.user_notes) {
        notes.push(...result.user_notes);
      }

      page++;
    }

    return notes.filter((note) => note.body !== '');
  }

  private get d3SessionHeaders() {
    return {
      'X-Futuware-UID': this.session.uid,
      'X-Futuware-SID': this.session.sid
    };
  }

  private get fingerprintHeaders() {
    return {
      'X-Client-Key': this.clientFingerprint,
      'X-Session-Key': this.sessionFingerprint,
      'X-User-Name': this.session?.user?.login ?? ''
    };
  }

  async activities(username: string): Promise<ActivitiesResponse> {
    const groomActivity = (activity: Activity): Activity => {
      activity.datetime = new Date(activity.created * 1000);
      const date = new Date(activity.datetime);
      date.setHours(0, 0, 0);
      activity.date = date;
      const time = new Date(1900, 0);
      time.setHours(activity.datetime.getHours(), activity.datetime.getMinutes());
      activity.time = time;
      return activity;
    }

    const activitiesResponse = await this.fetchJson(
      `Посты и комментарии ${username}`,
      `${environment.apiUrl}/users/${username}/activities/`, {
        method: 'GET',
        headers: this.fingerprintHeaders
      }) as ActivitiesResponse;
    activitiesResponse.posts = activitiesResponse.posts.map(groomActivity);
    activitiesResponse.comments = activitiesResponse.comments.map(groomActivity);
    return activitiesResponse;
  }

  async votes(username: string): Promise<VotersResponse> {
    const cacheKey = `votes_${username}`;

    const result = this.getLocalCache(cacheKey);

    if (result) {
      return result;
    }

    const json = await this.fetchJson(
      `Голоса в последних постах и комментариях ${username}`,
      `${environment.apiUrl}/users/${username}/votes/`,
      {
        method: 'GET',
        headers: this.fingerprintHeaders
      });

    this.setLocalCache(cacheKey, json, 1000 * 60 * 5); // 5m

    return json;
  }

  async domainVotes(prefix: string): Promise<VotersResponse> {
    const cacheKey = `domain_votes_${prefix}`;

    const result = this.getLocalCache(cacheKey);

    if (result) {
      return result;
    }

    const json = await this.fetchJson(
      `Голоса в последних постах сообщества https://${prefix}.d3.ru`,
      `${environment.apiUrl}/domains/${prefix}/votes/`, {
        method: 'GET',
        headers: this.fingerprintHeaders
      });

    this.setLocalCache(cacheKey, json, 1000 * 60 * 5); // 5m

    return json;
  }

  async postVotes(postId: string): Promise<Vote[]> {
    const votes = await this.fetchJson(
      `Голоса в посте https://d3.ru/${postId}`,
      `${environment.apiUrl}/posts/${postId}/votes/?cache=${Math.floor(new Date().getTime() / 1000.0)}`, {
        method: 'GET',
        headers: this.fingerprintHeaders
      });

    for (const vote of votes) {
      vote.datetime = new Date(vote.changed * 1000);
    }

    return votes;
  }

  async electionVotes(domain?: string): Promise<any[]> {
    if (!domain) {
      const json = await this.fetchJson(
        `Последние голоса избирателей по всем сообществам`,
        `${environment.apiUrl}/domains/votes/?cache=${Math.floor(new Date().getTime() / 1000.0)}`, {
          method: 'GET',
          headers: this.fingerprintHeaders
        });
      return json;
    }

    let votes = [];
    let offset = 0;

    let needBreak = false;

    while (!needBreak) {
      const now = Math.floor(new Date().getTime() / 1000.0);
      const batch = await this.fetchJson(
        `Голоса избирателей в сообществе https://${domain}.d3.ru со смещением на ${offset}`,
        `${environment.apiUrl}/domains/votes/?domain=${domain}&offset=${offset}&cache=${now}`, {
          method: 'GET',
          headers: this.fingerprintHeaders
        });

      offset = batch.offset;

      if (batch.votes.length === 0 || offset === null) {
        // TODO: написать что-нибудь
        needBreak = true;
      }

      votes.push(...batch.votes.filter(v => v.domain.url === `${domain}.d3.ru`).map(v => {
        return {
          created_at: v.created_at,
          from: v.voter.login,
          to: v.user.login
        };
      }));

      if (votes.length === 0) {
        return [];
      }

      votes.sort((a, b) => a.created_at < b.created_at ? 1 : -1);

      for (let i = 0; i < votes.length; i++) {
        if ((i + 1) < votes.length && votes[i].created_at - votes[i + 1].created_at > 86400) {
          votes = votes.slice(0, i + 1);
          needBreak = true;
        }
      }
    }

    votes.sort((a, b) => {
      if (a.to > b.to) {
        return 1;
      }
      if (a.to < b.to) {
        return -1;
      }
      return a.created_at > b.created_at ? 1 : -1;
    });

    for (let i = 0; i < votes.length; i++) {
      if (i === 0 || votes[i].to !== votes[i - 1].to) {
        votes[i].vote = 1;
      } else {
        votes[i].vote = votes[i - 1].vote + 1;
      }
    }

    votes.sort((a, b) => a.created_at > b.created_at ? 1 : -1);

    return votes;
  }

  async post(id: string): Promise<Post> {
    const cacheKey = `post_${id}`;
    let post = this.getLocalCache(cacheKey);

    if (post) {
      return post;
    }

    post = await this.fetchJson(
      `Пост https://d3.ru/${id}`,
      `https://d3.ru/api/posts/${id}/?cache=${Math.floor(new Date().getTime() / 1000.0)}`);

    const tops = await this.fetchJson(
      `Данные о пребыввнии поста https://d3.ru/${id} на главной`,
      `${environment.apiUrl}/posts/${id}`,
      {
        method: 'GET',
        headers: this.fingerprintHeaders
      });

    if (tops) {
      post.tops = tops;
    }

    this.setLocalCache(cacheKey, post, 1000 * 60);
    return post;
  }

  async recentPosts(username: string): Promise<Post[]> {
    try {
      const json = await this.fetchJson(
        `Последние посты ${username}`, `https://d3.ru/api/users/${username}/posts/?per_page=10`);
      return json.posts;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async comments(postId: string): Promise<Comment[]> {
    const json = await this.fetchJson(
      `Комментарии поста https://d3.ru/${postId}`,
      `${environment.apiUrl}/posts/${postId}/comments/`, {
      method: 'GET',
      headers: this.fingerprintHeaders
    });
    const postComments = json.comments;
    for (const postComment of postComments) {
      postComment.datetime = new Date(postComment.created * 1000);
      if (postComment.rating === null) {
        postComment.rating = 0;
      }
    }
    return postComments;
  }

  async domain(prefix: string): Promise<any> {
    const json = await this.fetchJson(
      `Сообщество https://${prefix}.d3.ru`,
      `${environment.apiUrl}/domains/${prefix}/`,
      {
        method: 'GET',
        headers: this.fingerprintHeaders
      });
    return json;
  }

  async bans(username: string): Promise<any> {
    return await this.fetchJson(
      `Баны пользователя ${username}`,
      `https://d3.ru/api/users/${username}/bans/`);
  }

  async top() {
    return await this.fetchJson(
      `Топ главной`,
      `${environment.apiUrl}/posts/`,
      {
        method: 'GET',
        headers: this.fingerprintHeaders
      });
  }

  async domainsReadersChange() {
    const cacheKey = `domain_readers_change`;

    let result = this.getLocalCache(cacheKey);

    if (result) {
      return result;
    }

    result = await this.fetchJson(
      `Последние изменения в подписчиках сообществ`,
      `${environment.apiUrl}/domains/readers`,
      {
        method: 'GET',
        headers: this.fingerprintHeaders
      });

    this.setLocalCache(cacheKey, result, 1000 * 60 * 1);

    return result;
  }

  async domainReaders(prefix: string) {
    return await this.fetchJson(
      `Подписчики сообщества https://${prefix}.d3.ru`,
      `${environment.apiUrl}/domains/${prefix}/readers`);
  }

  async note(author: string) {
    if (this.anonymous) {
      return null;
    }

    const cacheKey = `note_from_${author}_to_${this.session?.user?.login}`;

    let result = this.getLocalCache(cacheKey);

    if (!result) {
      try {
        const url = `https://d3.ru/api/user_notes/?user_login=${this.session?.user?.login}&author_login=${author}`;

        result = await this.fetchJson(`Заметка от ${author} в профиле ${this.session?.user?.login}`,
          url,
          {
            method: 'GET',
            headers: this.d3SessionHeaders
          });
        this.setLocalCache(cacheKey, result, random(0, 1000 * 60 * 60 * 24 * 7));
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    if (result.item_count < 1) {
      return null;
    }

    const note = result.user_notes[0];
    note.author = author;
    return note;
  }

  setLocalCache(key, value, ttlInMs) {
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + ttlInMs
    }
    localStorage.setItem(key, JSON.stringify(item));
  }

  getLocalCache(key) {
    const json = localStorage.getItem(key);
    if (!json) {
      return null;
    }

    let item;

    try {
      item = JSON.parse(json);
    } catch (error) {
      console.error(key, json, error);
      return;
    }

    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  pruneLocalCache() {
    if (localStorage.length < this.pruneThreshold) {
      return;
    }

    let count = 0;

    for (const [key, _] of Object.entries(localStorage)) {
      if (key === this.clientFingerprintKey) {
        continue;
      }

      if (this.getLocalCache(key) === null) {
        count++;
      }
    }

    if (count > 0) {
      console.info(`Кэш прорежен. ${count} удалено. ${localStorage.length} осталось.`);
    }
  }

  resetSession(): Session {
    localStorage.setItem(this.sessionKey, '{ }');
    return { };
  }

  checkSession() {
    if (this.anonymous) {
      return;
    }
    const params = {
      method: 'GET',
      headers: this.d3SessionHeaders
    };
    fetch(`https://d3.ru/api/posts/subscriptions/`, params).then(response => {
      if (!response.ok) {
        this.resetSession();
        window.location.reload();
      }
    });
  }

  get anonymous(): boolean {
    return !(!!this.session?.uid && !!this.session?.sid && !!this.session?.user);
  }

  get clientFingerprint(): string {
    return this.getFingerprint(this.clientFingerprintKey, localStorage);
  }

  get sessionFingerprint(): string {
    return this.getFingerprint(this.sessionFingerprintKey, sessionStorage);
  }

  private getFingerprint(key: string, storage: Storage): string {
    let fingerprint = storage.getItem(key);
    if (fingerprint !== null) {
      return fingerprint;
    }
    fingerprint = uuid();
    storage.setItem(key, fingerprint);
    return fingerprint;
  }

  get session(): Session {
    const session: Session = JSON.parse(localStorage.getItem(this.sessionKey));
    if (session === null) {
      return this.resetSession();
    }
    return session;
  }

  set session(session: Session) {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  async lopata(username: string): Promise<number> {
    const headers = this.fingerprintHeaders;
    headers['Content-Type'] = 'application/json';
    const response = await fetch(`${environment.apiUrl}/lopata/${username}`, {
      method: 'GET',
      headers
    });
    const json = await response.json();
    return json.lopata;
  }
}
