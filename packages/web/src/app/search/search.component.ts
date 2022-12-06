import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs';
import { AppStateService } from '../app-state.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
})
export class SearchComponent {
  searchTerm = '';
  @ViewChild('input')
  input!: ElementRef;

  constructor(public appState: AppStateService) {
    this.appState.searchTerm$.pipe(distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.search();
    });
  }

  search() {
    this.appState.search(this.searchTerm).subscribe((data) => {
      this.appState.searchResults$.next(data);
    });
    this.appState.searchTerm$.next(this.searchTerm);
  }

  ngAfterViewInit(): void {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        distinctUntilChanged(),
        tap((term) => this.appState.searchTerm$.next(term)),
        mergeMap((term: string) => this.appState.search(term))
      )
      .subscribe((data) => {
        this.appState.searchResults$.next(data);
      });
  }
}
