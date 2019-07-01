////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpHeaders } from '@angular/common/http';



import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from './place';
import {Station} from './station';




const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  uri = 'http://localhost:4000';

  constructor(private http: HttpClient) { 
 

  }
//: Observable<Place[]> 
  getPlaces() {
    return this.http.get<Place[]>(`${this.uri}/places`);
  }
 

  getPlaceSelected() {
    return this.http.get(`${this.uri}/place_selected`);
  }


  getStations() {
    return this.http.get(`${this.uri}/stations`);
  }



  findPlaces(find, where,zipcode) {
    const find_places_at = {
      find: find,
      where: where,
      zipcode: zipcode
    };

    return this.http.post(`${this.uri}/places/find`, find_places_at, httpOptions);

  }

getStation_selected(){
  return this.http.get(`${this.uri}/station_selected`);
}

  station_selected(stationName,hours){
    const stationNameDetails={
      stationName: stationName,
      hours:hours
    };
    
    var str = JSON.stringify(stationNameDetails, null, 2);
    return this.http.post(`${this.uri}/station_selected`, stationNameDetails, httpOptions);


  }
  getLogstash_divvy_data(): Observable<Station[]>{
    return this.http.get<Station[]>(`${this.uri}/logstashdata`);
  }
  
  logstash_divvy_data(stationName,hours){
    const stationNameDetails={
      stationName: stationName,
      hours:hours
    };
    console.log("placeservices-hours:",hours)
    var str = JSON.stringify(stationNameDetails, null, 2);
    return this.http.post(`${this.uri}/logstashdata`, stationNameDetails, httpOptions);

    
  }
  
  findStations(placeName) {
    const find_stations_at = {
      placeName: placeName
    };

    var str = JSON.stringify(find_stations_at, null, 2);


    return this.http.post(`${this.uri}/stations/find`, find_stations_at, httpOptions);

  }

 
  getDivvy_heatmap(){
    return this.http.get(`${this.uri}/divvy_docks`);
  }
  
    divvy_heatmap(hours){
      const find_stations_at = {
        placeName: "Chicago",
        hours: hours
      };
  
      
      
      //var str = JSON.stringify( null, 2);
      console.log("call ho raha hai kya")
      return this.http.post(`${this.uri}/divvy_docks/find`,find_stations_at, httpOptions);
  
  
    }
  

  
}


