////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from '../../place';
import { PlacesService } from '../../places.service';
import { Input, ViewChild, NgZone } from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { google } from 'google-maps';
import { GeoLocationService } from '../../geo-location.service';
import { MatTableDataSource, MatSort , MatSortModule } from '@angular/material';

interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

declare var google: any;

@Component({
  selector: 'app-list-of-places',
  templateUrl: './list-of-places.component.html',
  styleUrls: ['./list-of-places.component.css'],
  styles: ['agm-map { height: 500px; /* height is required */ }', 'agm-marker{font-weight: bold}'],
  providers: [GeoLocationService]
  
})


export class ListOfPlacesComponent implements OnInit {
  uri = 'http://localhost:4000';
  
  places: Place[];
  markers: Place[];
  latitude = 41.878;
  longitude = -87.629;
  zoom: number = 13;
  labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  
  
  //circleRadius:number = 3000; // km
  
  
  private margin = { top: 40, right: 50, bottom: 100, left: 100 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private g: any;
  private coordinates;
  position ='below';
  displayedColumns = ['name', 'display_phone', 'address1', 'is_closed', 'rating', 'review_count', 'Divvy'];
  dataSource = new MatTableDataSource<Place>();
  @ViewChild(MatSort) sort: MatSort;
  private userLat = null;
  
  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  }
  
  
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient, private geoLocationService: GeoLocationService) { }
  
  
  ngOnInit() {
    
    this.fetchPlaces();
    
  }
  
  
  
  currLocation() {
    console.log("Fetching Current location");
    // this.geoLocationService.getPosition().subscribe(
    //   (pos: Position) => {
    //     this.coordinates = {
    //       latitude: +(pos.coords.latitude),
    //       longitude: +(pos.coords.longitude)
    //     };
    //   });
    //   this.location.lat = this.coordinates.latitude;
    //   this.location.lng = this.coordinates.longitude;
    //   this.location.zoom = 12;
    
    
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
  
  
  
  fetchPlaces() {
    this.placesService
    .getPlaces()
    .subscribe((data: Place[]) => {
      this.places = data;
      this.markers = data;
      this.dataSource.data = this.places;
      //this.placeslinechart();
      
    });
  }
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  
  chart_type(type) {
    if (type == 1) {
      this.placeslinechart();
    }
    else if (type == 2) {
      
      this.placeBarChart();
    }
    
    
  }
  
  placeslinechart() {
    d3.selectAll("svg > *").remove();
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    
    this.x.domain(this.places.map((d) => d.name));
    this.y.domain([0, d3Array.max(this.places, (d) => +d.review_count)]);
    
    this.g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + this.height + ')')
    .text('Places')
    .call(d3Axis.axisBottom(this.x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-25)");
    this.g.append('g')
    .attr('class', 'y axis')
    .call(d3Axis.axisLeft(this.y))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(0)");
    
    
    
    this.line = d3Shape.line()
    .x((d: any) => this.x(d.name))//d.loggingtime
    .y((d: any) => this.y(d.review_count));
    
    
    
    
    this.g.append("path")
    .datum(this.places)
    .attr("fill", "none")
    .attr("class", "line")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", this.line);
    
    
    console.log("Reached Here");
    
  }
  
  placeBarChart() {
    d3.selectAll("svg > *").remove();
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    
    this.x.domain(this.places.map((d) => d.name));
    console.log("d.name:", this.places.map((d) => d.name));
    this.y.domain([0, d3Array.max(this.places, (d) => +d.review_count)]);
    console.log("d.rating:", this.places.map((d) => d.review_count));
    this.g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + this.height + ')')
    .text('Places')
    .call(d3Axis.axisBottom(this.x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-15)");
    this.g.append('g')
    .attr('class', 'y axis')
    .call(d3Axis.axisLeft(this.y))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(0)");
    
    this.g.selectAll('.bar')
    .data(this.places)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr("fill", "violet")
    .on("mouseover", function () {
      d3.select(this)
      .attr("fill", "pink");
    })
    .on("mouseout", function () {
      d3.select(this)
      .attr("fill", "violet");
    })
    
    .attr('x', (d) => this.x(d.name))
    .attr('y', (d) => this.y(d.review_count))
    .attr('width', this.x.bandwidth())
    .attr('height', (d) => this.height - this.y(d.review_count));
  }
  
  findStations(placeName) {
    
    for (var i = 0, len = this.places.length; i < len; i++) {
      
      if (this.places[i].name === placeName) { // strict equality test
        
        var place_selected = this.places[i];
        
        break;
      }
    }
    
    
    this.placesService.findStations(placeName).subscribe(() => {
      this.router.navigate(['/list_of_stations']);
    });
    
  }
  
  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }
  
  
  circleRadius: number = 3000; // km
  
  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 13
  };
  
  
  
  
  
  
}