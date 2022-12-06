import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchComponent } from './search/search.component';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SearchResultComponent } from './search-result/search-result.component';
import { VarDirective } from './ng-var.directive';
import { HintsComponent } from './hints/hints.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { MarkdownModule } from 'ngx-markdown';
import { APP_BASE_HREF } from '@angular/common';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    SearchResultComponent,
    VarDirective,
    HintsComponent,
    DetailViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    MarkdownModule.forRoot(),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: environment.baseUrl }],
  bootstrap: [AppComponent],
})
export class AppModule {}
