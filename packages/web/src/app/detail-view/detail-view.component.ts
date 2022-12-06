import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppStateService } from '../app-state.service';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.less'],
})
export class DetailViewComponent {
  isPackageOpen$ = this.activatedRoute.paramMap
    .pipe(map((params) => params.has('package')))
    .subscribe((state) => {
      this.isError = false;
      this.isLoading = true;
      this.appState.isResultShown$.next(state);
    });

  packagePath$ = this.activatedRoute.paramMap.pipe(
    map((params) =>
      params.has('scope')
        ? `${params.get('scope')}/${params.get('package')}`
        : `${params.get('package')}`
    ),
    mergeMap((path) =>
      this.appState.detail(path).pipe(
        catchError(() => {
          this.onError();
          return '';
        })
      )
    )
  );

  readmePath$ = this.packagePath$.pipe(
    map(
      (packageJson) =>
        `${environment.backendUrl}browse/${packageJson.name}@${packageJson.version}/README.md`
    )
  );

  importPath$ = this.packagePath$.pipe(
    map(
      (packageJson) =>
        `${environment.backendUrl}${packageJson.name}@${packageJson.version}`
    )
  );

  isLoading = true;
  isError = false;
  quickCopyDynamic = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appState: AppStateService
  ) {}

  onError() {
    this.isError = true;
    this.isLoading = false;
  }

  onLoad() {
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.appState.isResultShown$.next(false);
  }

  copy(url: string) {
    navigator.clipboard.writeText(this.getPath(url));
  }

  getPath(url: string) {
    if (!url?.startsWith('http')) {
      url = `${window.location.protocol}//${window.location.hostname}${url}`
    }
    if (this.quickCopyDynamic) {
      return `import('${url}')\n  .then((module) => console.log(module));`;
    }
    return `import { default as module } from '${url}';`;
  }
}
