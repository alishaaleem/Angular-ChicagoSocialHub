////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import {Place} from '../../place';


import { Input, ViewChild, NgZone} from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { GeoLocationService } from '../../geo-location.service';






interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?:string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}



@Component({
  selector: 'app-list-of-stations',
  templateUrl: './list-of-stations.component.html',
  styleUrls: ['./list-of-stations.component.css'],
  providers:[GeoLocationService]
})
export class ListOfStationsComponent implements OnInit {

  stations: Station[];
  markers: Station[];
  placeSelected: Place;
  private coordinates;
  private position="below";
  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'lastCommunicationTime', 'latitude',  'longitude', 'status', 'totalDocks','realtimeChart','linechart','dashboard'];
  private userLat = null;

  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  }



  constructor(private placesService: PlacesService, private router: Router,private geoLocationService:GeoLocationService) { }

  ngOnInit() {
    this.fetchStations();
    this.getPlaceSelected();


  }
 
  currLocation(){
    console.log("Fetching Current location");
    
    if(navigator.geolocation) {
      let locationArray = {
        "latittude" : Number,
        "longitude" : Number
      }
      navigator.geolocation.getCurrentPosition((locationArray) => {
        console.log("user position: \n");
        console.log(locationArray.coords);
        this.userLat=locationArray
        this.location.lat = this.userLat.coords.latitude;
        this.location.lng = this.userLat.coords.longitude;
        this.location.zoom = 12;
      });
    
    }
  }

  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.markers = data;

      });
  }


  getPlaceSelected() {
    this.placesService
      .getPlaceSelected()
      .subscribe((data: Place) => {
        this.placeSelected = data;

      });
  }

  station_selected(stationName,hours){
    for (var i = 0,len = this.stations.length; i < len; i++) {

      if ( this.stations[i].stationName === stationName ) { // strict equality test

          var  station_selected =  this.stations[i];

          break;
      }
    }
    console.log("For loop worked in selected_station,station_selected:",station_selected);
    console.log(hours)
    this.placesService.logstash_divvy_data(stationName,hours).subscribe(() => {
      // this.router.navigate(['/line-chart']);
      this.router.navigate(['/line-chart'], { queryParams: {stationName,hours} });
      console.log("reached here");
    });
  }

  realtimechart_selected(stationName,hours){
    // for (var i = 0,len = this.stations.length; i < len; i++) {

    //   if ( this.stations[i].stationName === stationName ) { // strict equality test

    //       var  station_selected =  this.stations[i];

    //       break;
    //   }
    // }
   //console.log("For loop worked in realtime,station_selected:",station_selected);
   
    this.placesService.logstash_divvy_data(stationName,hours).subscribe(() => {
      console.log("yahaan agaya");
      this.router.navigate(['/realtimechart'], { queryParams: {stationName,hours} });
      console.log("realtimechart reached here");
    });

  }


  SMA_selected(stationName,hours){
    for (var i = 0,len = this.stations.length; i < len; i++) {

      if ( this.stations[i].stationName === stationName ) { // strict equality test

          var  station_selected =  this.stations[i];

          break;
      }
    }
    console.log("For loop worked in dashboard,station_selected:",station_selected);
   
    this.placesService.station_selected(stationName,hours).subscribe(() => {
      this.router.navigate(['/sma'], { queryParams: {stationName,hours} });
      console.log("sma reached here");
    });

  }

 

  dashboard_selected(stationName,hours){
    for (var i = 0,len = this.stations.length; i < len; i++) {

      if ( this.stations[i].stationName === stationName ) { // strict equality test

          var  station_selected =  this.stations[i];

          break;
      }
    }
    console.log("For loop worked in dashboard,station_selected:",station_selected);
   
    this.placesService.station_selected(stationName,hours).subscribe(() => {
      this.router.navigate(['/dashboard'], { queryParams: {stationName,hours} });
      console.log("dashboard reached here");
    });

  }


clickedMarker(label: string, index: number) {
  console.log(`clicked the marker: ${label || index}`)
}


circleRadius:number = 3000; // km

public location:Location = {
  lat: 41.882607,
  lng: -87.643548,
  label: 'You are Here',
  zoom: 13
};


// getLocation(){
  
//   navigator.geolocation.getCurrentPosition(this.showPosition(position));
// } 
// showPosition(position) {
//   this.currLat=position.coords.latitude;
//   this.currLong =position.coords.longitude;
// }
}






