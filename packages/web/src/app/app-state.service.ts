import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  searchResults$ = new BehaviorSubject<any>([]);
  isResultShown$ = new BehaviorSubject<boolean>(false);
  searchTerm$ = new BehaviorSubject<string>('');

  constructor(private client: HttpClient) {}

  search(term: string) {
    if (term === '') {
      return of([]);
    }
    return this.client.get<[]>(
      `${environment.backendUrl}browse/search/${term}`
    );
  }

  detail(path: string) {
    return this.client.get<any>(`${environment.backendUrl}browse/${path}`);
  }
}
