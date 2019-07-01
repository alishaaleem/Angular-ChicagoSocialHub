

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as c3 from 'c3';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import { MatMenuModule } from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import * as d3Time from 'd3-time';


export interface Timeselection {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  title = "Dashboard for Daily and Hourly Status of Available Docks"
  public StationName;
  constructor(private PlacesService: PlacesService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      console.log(params);

      // console.log(params.stationName);

      this.StationName = params.stationName;

      console.log(this.StationName);
    });
  }
  // selectedValue: 'Past Week';
  // timeselection: Timeselection[] = [
  //   { value: '1', viewValue: 'Past Week' },
  //   { value: '2', viewValue: 'Past Month' },
  //   { value: '3', viewValue: 'Past Year' }
  // ];
  private margin = { top: 40, right: 20, bottom: 30, left: 100 };
  private width: number;
  private height: number;
  stations: Station[] = [];
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private g: any;
  private chart1: any;
  private chart2: any;
  private hours: any = 168;
  log_24hour: any = [];
  smaData_24hour: any = [];
  log_1hour: any = [];
  smaData_1hour: any = [];
  private granularityConst: any;

  private showLoadingImg1 = true;
  private showLoadingImg2 = true;
  private showText = "Loading";

  ngOnInit() {
    this.dailystatus();
    this.hourlystatus();
  }
  show_line_chart(hours) {
    var stationName = this.StationName;
    this.hours = hours;
    console.log(stationName);
    console.log(hours);
    this.PlacesService.logstash_divvy_data(stationName, hours).subscribe(() => {

      d3.selectAll("svg > *").remove();

      this.dailystatus();
      this.hourlystatus();

      // console.log("Reached");
    });

  }



  movingAverage = (data, hourinterval) => {
    var arr = []
    data.map((row, index, total) => {

      const endindex = total.length - index - 1
      var startindex = endindex
      const endtime = total[endindex].lastCommunicationTime
      var starttime = new Date(endtime)
      //starttime = new Date(starttime.setTime(starttime.getTime()))
      starttime.setHours(starttime.getHours() - hourinterval)

      var timelimit = new Date(total[total.length - 1].lastCommunicationTime)
      //timelimit = new Date(timelimit.setTime(timelimit.getTime()))
      timelimit.setHours(timelimit.getHours() - this.hours)

      //console.log(starttime, endtime)
      var sum = 0
      var count = 0
      //console.log(timelimit)
      while (total[startindex] != undefined && total[startindex].lastCommunicationTime > starttime) {
        sum += total[startindex].availableDocks
        count++
        startindex--
      }
      if (endtime > timelimit) {

        var avg = sum / count

        // if(index < 30){
        //   console.log(total[startindex + 1], starttime)
        //   console.log('sum=', sum)
        // }

        if (total[startindex] != undefined) {
          startindex++
        }
        //const subset = total.slice(startindex, endindex + 1);
        //console.log(subset)
        //console.log(startindex, endindex + 1)
        arr.push({ lastCommunicationTime: total[endindex].lastCommunicationTime, availableDocks: avg })
        //return {logTime: total[endindex].logTime, availableDocks_avg: avg}
      }

    });
    return arr
  }

  createchart() {

    if (this.hours == 168) {
      this.granularityConst = d3Time.timeDay.every(1);
      this.stations = this.log_1hour
    }
    else if (this.hours == 720) {
      this.granularityConst = d3Time.timeWeek.every(1);
      this.stations = this.log_24hour
    }
    else if (this.hours == 8760) {
      this.granularityConst = d3Time.timeMonth.every(1);
      this.stations = this.log_24hour
    }
  }

  dailystatus() {
    this.showLoadingImg1=true
    this.createchart()
    this.PlacesService.logstash_divvy_data(this.StationName, 24 + this.hours).subscribe(() => {
      this.PlacesService
        .getLogstash_divvy_data()
        .subscribe((data: Station[]) => {
          this.stations = data;
          this.log_24hour = [];
          //this.stations = data;
          for (var i = 0; i < data.length; i++) {
            this.log_24hour.push({ lastCommunicationTime: new Date(data[i].lastCommunicationTime.toString()), availableBikes: +data[i].availableBikes, availableDocks: +data[i].availableDocks, totalDocks: +data[i].totalDocks })
          }
          console.log("calcAvg-24", this.log_24hour);
          //this.smaData_24hour.push(this.calculateAverage(this.log_24hour));
          this.smaData_24hour = this.movingAverage(this.log_24hour, 24)
          console.log("SMA-24", this.smaData_24hour);

          //first svg chart-----daily SMA Chart with User Time range
          this.chart1 = d3.select('#svg1');
          this.width = +this.chart1.attr('width') - this.margin.left - this.margin.right;
          this.height = +this.chart1.attr('height') - this.margin.top - this.margin.bottom;
          this.g = this.chart1.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
          this.x = d3Scale.scaleTime().rangeRound([0, this.width]);
          this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);

          this.x.domain(d3Array.extent(this.stations, (d) => new Date(d.lastCommunicationTime.toString())));
          this.y.domain([0, d3Array.max(this.stations, (d) => d.totalDocks)]);

          this.g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x).ticks(this.granularityConst))
            .append('text')
            .text('Time');
          this.g.append('g')
            .attr('class', 'y axis')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('fill', '#000')
            // .attr('text-anchor', 'end')
            .text('totalDocks');

          this.line = d3Shape.line()
            .x((d: any) => this.x(new Date(d.lastCommunicationTime.toString())))//d.loggingtime
            .y((d: any) => this.y(d.availableDocks));

          this.g.append("path")
            .datum(this.smaData_24hour)
            .attr("fill", "none")
            .attr("class", "line")
            .attr("stroke", "Blue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", this.line);
          console.log("Reached Here");
          let legend = this.chart1.append('g')
          .attr('x', 20)
          .attr('y', 10)
          .attr('width', 18)
          .attr('height', 10)
  
          legend.append('rect')
            .attr('x',120)
            .attr('y',35)
            .attr('width',18)
            .attr('height',10)
            .attr('fill','Blue');
    
            legend.append('text')
            .attr('x',140)
            .attr('y',35)
            .attr('dy','0.6em')
            .text("SMA for 24 hours")

          this.showLoadingImg1=false;
        });
    });
  }

  hourlystatus() {
    this.showLoadingImg2=true
    this.createchart()
    this.PlacesService.logstash_divvy_data(this.StationName, 1 + this.hours).subscribe(() => {
      this.PlacesService
        .getLogstash_divvy_data()
        .subscribe((data: Station[]) => {
          this.log_1hour = []
          //this.stations = data;
          for (var i = 0; i < data.length; i++) {
            this.log_1hour.push({ lastCommunicationTime: new Date(data[i].lastCommunicationTime.toString()), availableBikes: +data[i].availableBikes, availableDocks: +data[i].availableDocks, totalDocks: +data[i].totalDocks })
          }
          console.log("calcAvg-1", this.log_1hour);
          //this.smaData_1hour.push(this.calculateAverage(this.log_1hour));
          this.smaData_1hour = this.movingAverage(this.log_1hour, 1)
          console.log("smaData_1hour", this.smaData_1hour);
          //second svg chart-----hourly SMA Chart with User Time range
          this.chart2 = d3.select('#svg2');
          this.width = +this.chart2.attr('width') - this.margin.left - this.margin.right;
          this.height = +this.chart2.attr('height') - this.margin.top - this.margin.bottom;
          this.g = this.chart2.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
          this.x = d3Scale.scaleTime().rangeRound([0, this.width]);
          this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);

          this.x.domain(d3Array.extent(this.stations, (d) => new Date(d.lastCommunicationTime.toString())));
          this.y.domain([0, d3Array.max(this.stations, (d) => d.totalDocks)]);

          this.g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .text('Time')
            .call(d3Axis.axisBottom(this.x).ticks(this.granularityConst));
          this.g.append('g')
            .attr('class', 'y axis')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('fill', '#000')
            // .attr('text-anchor', 'end')
            .text('totalDocks');

          this.line = d3Shape.line()
            .x((d: any) => this.x(new Date(d.lastCommunicationTime.toString())))//d.loggingtime
            .y((d: any) => this.y(d.availableDocks));

          this.g.append("path")
            .datum(this.smaData_1hour)
            .attr("fill", "none")
            .attr("class", "line")
            .attr("stroke", "Red")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", this.line);
          console.log("Reached Here");
          let legend = this.chart2.append('g')
          .attr('x', 20)
          .attr('y', 10)
          .attr('width', 18)
          .attr('height', 10)
  
          legend.append('rect')
            .attr('x',120)
            .attr('y',35)
            .attr('width',18)
            .attr('height',10)
            .attr('fill','Red');
    
            legend.append('text')
            .attr('x',140)
            .attr('y',35)
            .attr('dy','0.6em')
            .text("SMA for 1 hour")


this.showLoadingImg2 = false;




          //end of second svg
        });//end of station selected
    });
  }

}
