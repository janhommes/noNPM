import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.less'],
})
export class SearchResultComponent implements OnInit {
  constructor(public appState: AppStateService, private router: Router) {}

  ngOnInit(): void {}

  open(packageJson: any) {
    this.router.navigateByUrl(
      `/browse/${packageJson.name}@${packageJson.version}`
    );
    this.appState.searchResults$.next([]);
    this.appState.searchTerm$.next('');
  }

  searchForKeyword(keyword: string, event: Event) {
    event.stopPropagation();
    this.appState.searchTerm$.next(keyword);
  }
}
