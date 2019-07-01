import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import { Place } from '../../place';

import { Http, Response, RequestOptions, Headers } from '@angular/http';

import { Input, ViewChild, NgZone } from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { AgmCoreModule } from '@agm/core';
import { AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as heatmap from 'heatmap.js'
import { google } from 'google-maps';

declare var google: any;



@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
  styles: ['agm-map { height: 700px; /* height is required */ }']


})
export class HeatmapComponent implements OnInit {
  title = "Divvy HeatMap";
  latitude = 41.878;
  longitude = -87.629;
  mapType = 'satellite';
  zoom: number = 15;
  heatmapData = [];
  google: google;
  private map: google.maps.Map = null;
  heatmap: google.maps.visualization.HeatmapLayer = null;
  stn: Station[];
  private hours: any;
  currTime;
  interval = null

  constructor(private placesService: PlacesService, private router: Router) { }

  

  ngOnInit() {
    this.hours = 1
    this.fetchLogs();
  }

  private displayTime(){
    this.currTime = new Date().toLocaleString()
  }

  show_heatmap(hours) {
    this.hours=hours
    this.fetchLogs()
  }

  fetchLogs() {
    this.placesService.divvy_heatmap(this.hours).subscribe(() => {    
      this.placesService.getDivvy_heatmap().subscribe((data: Station[]) => {
        this.stn = data;
        console.log(this.stn)
        this.drawHeatMap()

        var _this = this
        this.interval = setTimeout(function(){
          _this.fetchLogs()
        }, 120000)
      });
      
    });
  }
ngOnDestroy(){
  if(this.interval){
    clearTimeout(this.interval)
    console.log(this.interval)
  }
}
  private drawHeatMap(){
    let coords1=[];

    for (let i = 0; i < this.stn.length; i++) {
      let locationArry = {
        location: new google.maps.LatLng(this.stn[i].latitude, this.stn[i].longitude),
        weight: this.stn[i].availableDocks
      }
    
     coords1.push(locationArry);
    }
    console.log(11111111111111, coords1)

    if(this.heatmap){
      this.heatmap.setMap(null)
    }

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,         
      data: coords1
    });
    this.displayTime()

  }


  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
   
  }
}
