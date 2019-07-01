////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';


import { MatToolbarModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule,MatMenuModule ,MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatDividerModule,MatSnackBarModule,MatTooltipModule, MatSortModule } from '@angular/material';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AgmOverlays } from "agm-overlays"
import { PlacesService } from './places.service';

import { FindComponent } from './components/find/find.component';
import { ListOfPlacesComponent } from './components/list-of-places/list-of-places.component';
import { ListOfStationsComponent } from './components/list-of-stations/list-of-stations.component';
import { BarChartComponent } from './components/BarChart/BarChart.component';
import { StackBarComponent } from './components/StackBar/StackBar.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SMAComponent } from '../app/components/sma/sma.component';
import { RealtimechartComponent } from '../app/components/realtimechart/realtimechart.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { BarreviewComponent } from './components/barreview/barreview.component';
import { CurrentlocationComponent } from './components/currentlocation/currentlocation.component';
import { AlertTableComponent } from './components/alert-table/alert-table.component';
import { AboutprojectComponent } from './components/aboutproject/aboutproject.component';


const routes: Routes = [
  { path: 'find', component: FindComponent},
  { path: 'list_of_places', component: ListOfPlacesComponent},
  { path: 'list_of_stations', component: ListOfStationsComponent},
  { path: 'barchart', component: BarChartComponent},
  { path: 'stackbar', component: StackBarComponent},
  { path: 'line-chart', component: LineChartComponent},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'sma', component: SMAComponent},
  {path: 'realtimechart', component: RealtimechartComponent},
  {path: 'home', component: HomepageComponent}, 
  {path: 'heatmap', component: HeatmapComponent}, 
  { path: 'barreview', component: BarreviewComponent},
  { path: 'currentlocation', component: CurrentlocationComponent},
  { path: 'alert-table', component: AlertTableComponent},
  { path: 'aboutproject', component: AboutprojectComponent},

  { path: '', redirectTo: 'home', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    FindComponent,
    ListOfPlacesComponent,
    ListOfStationsComponent,  
    BarChartComponent, 
    StackBarComponent, LineChartComponent, DashboardComponent, SMAComponent, RealtimechartComponent, HomepageComponent, HeatmapComponent, BarreviewComponent, CurrentlocationComponent, AlertTableComponent,AboutprojectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSortModule,

/////////////////////////////////////////////////////////////////////////////////////    
/////////////////////////// SETUP NEEDED ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//  1. Create your API key from Google Developer Website
//  2. Install AGM package: npm install @agm/core @ng-bootstrap/ng-bootstrap --
//  3. Here is the URL for an online IDE for NG and TS that could be used to experiment
//  4. AGM live demo is loacted at this URL: https://stackblitz.com/edit/angular-google-maps-demo


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


    AgmCoreModule.forRoot({apiKey: 'yourGoogleAPI'+ '&libraries=visualization'}),
    FormsModule,
    NgbModule
  ],

  providers: [PlacesService, GoogleMapsAPIWrapper],
  bootstrap: [AppComponent]
})
export class AppModule { }
