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
  selector: 'app-barchart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './BarChart.component.html',
  styleUrls: ['./BarChart.component.css']
})
export class BarChartComponent implements OnInit {
  title = 'Bar Chart For Places & their Ratings';

  private width: number;
  private height: number;
  places: Place[] = [];
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };

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
        this.svg = d3.select('svg');
        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);

        this.x.domain(this.places.map((d) => d.name));
        console.log("d.name:", this.places.map((d) => d.name));
        this.y.domain([0, d3Array.max(this.places, (d) => d.rating)]);
        console.log("d.rating:", this.places.map((d) => d.rating));
        this.g.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.height + ')')
          .text('Name')
          .call(d3Axis.axisBottom(this.x));
        this.g.append('g')
          .attr('class', 'y axis')
          .call(d3Axis.axisLeft(this.y).ticks(10))
          .append('text')
          .attr('class', 'axis-title')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'end')
          .text('Rating');
        this.g.selectAll('.bar')
          .data(this.places)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => this.x(d.name))
          .attr('y', (d) => this.y(d.rating))
          .attr('width', this.x.bandwidth())
          .attr('height', (d) => this.height - this.y(d.rating));
      });
  }
}
