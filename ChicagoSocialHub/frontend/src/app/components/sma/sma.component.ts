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
import * as d3Time from 'd3-time';


@Component({
    selector: 'app-sma',
    templateUrl: './sma.component.html',
    styleUrls: ['./sma.component.css']
})
export class SMAComponent implements OnInit {
    title = 'SMA';
    public StationName;
    constructor(private PlacesService: PlacesService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute) {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            console.log(params);
            this.hours = parseInt(params.hours);
            this.StationName = params.stationName;
            console.log(this.StationName);
        });
    }
    private margin = { top: 60, right: 20, bottom: 30, left: 100 };
    private width: number;
    private height: number;
    private stations: Station[] = [];
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;
    private sma_red: d3Shape.Line<[number, number]>;
    private sma_blue: d3Shape.Line<[number, number]>;
    private sma_green: d3Shape.Line<[number, number]>;

    private g: any;
    private hours: any = 1;
    log_1hour: any = [];
    smaData_1hour: any = [];
    log_24hour: any = [];
    smaData_24hour: any = [];
    log_7d: any = [];
    smaData_7d: any = [];
    private granularityConst: any;

    private interval = null;



    ngOnInit() {



        this.chart_24();
        this.interval = setInterval(() => { this.chart_24(); }, 180000)

    }

    ngOnDestroy() {
        if(this.interval){
            clearInterval(this.interval)
        }
    }

    show_line_chart(hours) {
        //var hours = hours;
        this.hours = hours
        
        this.chart_24();


    }


    calculateAverage(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i].availableDocks
        }
        console.log(arr.length, arr[arr.length - 1])
        return { lastCommunicationTime: arr[arr.length - 1].lastCommunicationTime, availableDocks_avg: sum / arr.length }
    }

    movingAverage = (data, hourinterval) => {
        var arr = []
        data.map((row, index, total) => {
          
          const endindex = total.length - index - 1
          var startindex = endindex
          const endtime = total[endindex].logTime
          var starttime = new Date(endtime)
          //starttime = new Date(starttime.setTime(starttime.getTime()))
          starttime.setHours(starttime.getHours() - hourinterval)
    
          var timelimit = new Date(total[total.length - 1].logTime)
          //timelimit = new Date(timelimit.setTime(timelimit.getTime()))
          timelimit.setHours(timelimit.getHours() - this.hours)
    
          //console.log(starttime, endtime)
          var sum = 0
          var count = 0
          //console.log(timelimit)
          while(total[startindex] != undefined && total[startindex].logTime > starttime){
            sum += total[startindex].availableDocks
            count++
            startindex--
          }
          if(endtime > timelimit){
            
            var avg = sum/count 
            
            // if(index < 30){
            //   console.log(total[startindex + 1], starttime)
            //   console.log('sum=', sum)
            // }
            
            if(total[startindex] != undefined){
              startindex++
            }
            //const subset = total.slice(startindex, endindex + 1);
            //console.log(subset)
            //console.log(startindex, endindex + 1)
            arr.push({logTime: total[endindex].logTime, availableDocks_avg: avg})
            //return {logTime: total[endindex].logTime, availableDocks_avg: avg}
          }
          
        });
        return arr
      }

    chart_1() {
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
                    //this.chart_7();
                    this.createchart();
                });
        })
    }//end of station selected

    chart_24() {
        this.PlacesService.logstash_divvy_data(this.StationName, 24 + this.hours).subscribe(() => {
            this.PlacesService
                .getLogstash_divvy_data()
                .subscribe((data: Station[]) => {
                    this.log_24hour = [];
                    //this.stations = data;
                    for (var i = 0; i < data.length; i++) {
                        this.log_24hour.push({ lastCommunicationTime: new Date(data[i].lastCommunicationTime.toString()), availableBikes: +data[i].availableBikes, availableDocks: +data[i].availableDocks, totalDocks: +data[i].totalDocks })
                    }
                    console.log("calcAvg-24", this.log_24hour);
                    //this.smaData_24hour.push(this.calculateAverage(this.log_24hour));
                    this.smaData_24hour = this.movingAverage(this.log_24hour, 24)
                    console.log("smaData_24hour", this.smaData_24hour);
                    this.chart_1();

                });
        });
    }

    chart_7() {
        this.PlacesService.logstash_divvy_data(this.StationName, 168).subscribe(() => {
            this.PlacesService
                .getLogstash_divvy_data()
                .subscribe((data: Station[]) => {
                    this.log_7d = [];
                    for (var i = 0; i < data.length; i++) {
                        this.log_7d.push({ lastCommunicationTime: new Date(data[i].lastCommunicationTime.toString()), availableBikes: +data[i].availableBikes, availableDocks: +data[i].availableDocks, totalDocks: +data[i].totalDocks })
                    }
                    console.log("calcAvg-7", this.log_7d);
                    this.smaData_7d.push(this.calculateAverage(this.log_7d));
                    console.log("Data-7", this.smaData_7d);
                    this.createchart();

                });
        });
    }
    createchart() {

        if (this.hours == 1) {
            this.granularityConst = d3Time.timeMinute.every(2);
            this.stations = this.log_1hour
        }
        else if (this.hours == 24) {
            this.granularityConst = d3Time.timeHour.every(1);
            this.stations = this.log_24hour
        }
        else if (this.hours == 168) {
            this.granularityConst = d3Time.timeHour.every(12);
            this.stations = this.log_24hour
        }

console.log('this.stations')
console.log(this.stations)

        d3.selectAll("svg > *").remove();

        this.svg = d3.select('svg');
        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        this.x = d3Scale.scaleTime().rangeRound([0, this.width]);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
//console.log(this.stations)
        this.x.domain(d3Array.extent(this.stations, (d) => new Date(d.lastCommunicationTime.toString())));
        this.y.domain([0, d3Array.max(this.stations, (d) => d.totalDocks)]);

        this.g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
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
            .text('totalDocks');
//1hr-gree
        this.sma_green = d3Shape.line()
            .x((d: any) => this.x(d.lastCommunicationTime))//d.loggingtime
            .y((d: any) => this.y(d.availableDocks_avg));

        this.g.append("path")
            .datum(this.smaData_1hour)
            .attr("fill", "none")
            .attr("class", "sma_green")
            .attr("stroke", "green")
            .attr("stroke-width", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", this.sma_green);

        //720-past 24 hr       
        this.sma_blue = d3Shape.line()
            .x((d: any) => this.x(d.lastCommunicationTime))//d.loggingtime
            .y((d: any) => this.y(d.availableDocks_avg));

        this.g.append("path")
            .datum(this.smaData_24hour)
            .attr("fill", "none")
            .attr("class", "sma_blue")
            .attr("stroke", "Blue")
            .attr("stroke-width", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", this.sma_blue);
//7days - red line
        // this.sma_red = d3Shape.line()
        //     .x((d: any) => this.x(d.lastCommunicationTime))//d.loggingtime
        //     .y((d: any) => this.y(d.availableDocks_avg));

        // this.g.append("path")
        //     .datum(this.smaData_7d)
        //     .attr("fill", "none")
        //     .attr("class", "sma_red")
        //     .attr("stroke", "Red")
        //     .attr("stroke-width", 10)
        //     .attr("stroke-linejoin", "round")
        //     .attr("stroke-linecap", "round")
        //     .attr("d", this.sma_red);

            let legend = this.svg.append('g')
            .attr('x', 20)
            .attr('y', 10)
            .attr('width', 18)
            .attr('height', 10)
    
            legend.append('rect')
            .attr('x',20)
            .attr('y',5)
            .attr('width',18)
            .attr('height',10)
            .attr('fill','#FF0000');
    
            legend.append('text')
            .attr('x', 40)
            .attr('y', 5)
            .attr('dy','0.6em')
            .text("SMA for 7 Days")
    
            legend.append('rect')
            .attr('x',20)
            .attr('y',20)
            .attr('width',18)
            .attr('height',10)
            .attr('fill','Green');
    
            legend.append('text')
            .attr('x',40)
            .attr('y',20)
            .attr('dy','0.6em')
            .text("SMA for 1 hour")

            legend.append('rect')
            .attr('x',20)
            .attr('y',35)
            .attr('width',18)
            .attr('height',10)
            .attr('fill','steelblue');
    
            legend.append('text')
            .attr('x',40)
            .attr('y',35)
            .attr('dy','0.6em')
            .text("SMA for 24 hours")


        console.log("Reached Here");


    }
}
