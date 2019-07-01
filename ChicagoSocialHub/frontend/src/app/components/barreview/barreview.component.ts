import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { Place, } from '../../place';
import { PlacesService } from '../../places.service';
@Component({
  selector: 'app-barreview',
  templateUrl: './barreview.component.html',
  styleUrls: ['./barreview.component.css']
})
export class BarreviewComponent implements OnInit {
  title = 'Bar Review For Yelp Places';

  private width: number;
  private height: number;
  places: Place[] = [];
  private margin = { top: 30, right: 20, bottom: 70, left: 40 };

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.fetchPlaces();

  }
  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
        console.log("fetchplaces:", this.places);
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
          .attr("fill","steelblue")
          .attr('x', (d) => this.x(d.name))
          .attr('y', (d) => this.y(d.review_count))
          .attr('width', this.x.bandwidth())
          .attr('height', (d) => this.height - this.y(d.review_count));

        });
}
}