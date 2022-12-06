import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, map, tap } from 'rxjs';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  constructor(
    public appState: AppStateService,
    private router: Router
  ) {}

  goHome() {
    this.router.navigateByUrl('/');
  }
}
