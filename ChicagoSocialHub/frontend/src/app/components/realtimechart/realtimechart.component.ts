import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as c3 from 'c3';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Time from 'd3-time';
import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-realtimechart',
    templateUrl: './realtimechart.component.html',
    styleUrls: ['./realtimechart.component.css']
})
export class RealtimechartComponent implements OnInit {
    title = 'Real Time Line Chart with SMA for 1 hour and 24 hours';
    public StationName;
    constructor(private PlacesService: PlacesService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute) {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            //console.log(params);
            this.hours = params.hours;
            this.StationName = params.stationName;
            //console.log(this.StationName);
        });
    }
    private margin = { top: 60, right: 20, bottom: 30, left: 100 };
    private width: number;
    private height: number;
    stations: Station[] = [];
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;
    private sma_red: d3Shape.Line<[number, number]>;
    private sma_blue: d3Shape.Line<[number, number]>;
    private sma_1 = true;
    private sma_24 = true;
    private g: any;
    private hours: any;
    private SMAchoice: any;
    log_1hour: any = [];
    smaData_1hour: any = [];
    log_24hour: any = [];
    smaData_24hour: any = [];
    private granularityConst: any;
    
    private interval = null;
    
    ngOnInit() {
        this.linechart();
        
        this.interval = setInterval(() => { this.linechart(); }, 120000)
    }
    
    ngOnDestroy() {
        if(this.interval){
            clearInterval(this.interval)
        }
    }

    //Sending hours to placeServices
    show_line_chart(hours) {
        
        //console.log("From show_line_chart function",hours);
        //var hours = hours;
        this.hours = hours
        
        this.PlacesService.logstash_divvy_data(this.StationName, hours).subscribe(() => {
            this.linechart();
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
            starttime.setHours(starttime.getHours() - hourinterval);
            //console.log("timebfr",timelimit);
            var timelimit = new Date(total[total.length - 1].lastCommunicationTime);
            //console.log("timeafter",timelimit);
            //timelimit = new Date(timelimit.setTime(timelimit.getTime()))
            timelimit.setHours(timelimit.getHours() - this.hours)
            
            //console.log(starttime, endtime)
            var sum = 0
            var count = 0
            //console.log(timelimit)
            while(total[startindex] != undefined && total[startindex].lastCommunicationTime > starttime){
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
                arr.push({lastCommunicationTime: total[endindex].lastCommunicationTime, availableDocks_avg: avg})
                //return {logTime: total[endindex].logTime, availableDocks_avg: avg}
            }
            
        });
        return arr
    }
    
    // Calculate Average for SMA's
    calculateAverage(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i].availableDocks
        }
        return { lastCommunicationTime: arr[arr.length - 1].lastCommunicationTime, availableDocks_avg: sum / arr.length }
    }
    
    //Function for Checkbox
    SMAFunction(c) {
        if (c == 'sma_blue') {
            if (this.sma_1) {
                d3.selectAll('.sma_blue').attr('style', 'display:block')
            }
            else {
                d3.selectAll('.sma_blue').attr('style', 'display:none')
            }
        }
        if (c == 'sma_red') {
            if (this.sma_24) {
                d3.selectAll('.sma_red').attr('style', 'display:block')
            }
            else {
                d3.selectAll('.sma_red').attr('style', 'display:none')
            }
        }
        
        
    }
    
    //Function to fetch linechart data
    linechart() {
        this.PlacesService.logstash_divvy_data(this.StationName, this.hours).subscribe(() => {
            //console.log("linechart-hours", this.hours);
            this.PlacesService
            .getLogstash_divvy_data()
            .subscribe((data: Station[]) => {
                this.stations = data;
                console.log(this.stations)
                //d3.selectAll("svg > *").remove();
                this.chart_24();
            });
        })
        
    }//linechart end
    //Function to fetch Chart 24 hours data
    
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
                //console.log("calcAvg-24", this.calculateAverage(this.log_24hour));
                this.smaData_24hour = this.movingAverage(this.log_24hour, 24);
                //this.smaData_24hour.splice(this.smaData_24hour.length-3,2)
                this.smaData_24hour = this.smaData_24hour.splice(0, this.smaData_24hour.length-2)
                //console.log("Data-24", this.smaData_24hour);
                // this.createchart();
                this.chart_1();
                
            });
        });
    }
    //Function to fetch Chart 1 hours data
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
                this.smaData_1hour = this.movingAverage(this.log_1hour, 1);
                console.log("Data-1", this.smaData_1hour);
                this.smaData_1hour = this.smaData_1hour.splice(0, this.smaData_1hour.length-2)
                console.log("Data-1", this.smaData_1hour);
                this.createchart();
            });
        })
    }
    
    //Function to draw chart
    createchart() {
        if (this.hours==1){
            this.granularityConst=d3Time.timeMinute.every(2);
        }
        else if (this.hours==24){
            this.granularityConst=d3Time.timeHour.every(1);
        }
        else if (this.hours==168){
            this.granularityConst=d3Time.timeDay.every(1);
        }
        //console.log("this.stations")
        //console.log(this.stations)
        d3.selectAll("svg > *").remove();
        this.svg = d3.select('svg');
        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        this.x = d3Scale.scaleTime().rangeRound([0, this.width]);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
        // console.log("-------------------------------------");
        // console.log(this.stations.length)
        // console.log("1111111", d3Array.max(this.stations, (d) => +d.totalDocks))
        // console.log("-------------------------------------");
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
        .text('totalDocks');
        
        //line chart
        this.line = d3Shape.line()
        .x((d: any) => this.x(new Date(d.lastCommunicationTime.toString())))//d.loggingtime
        .y((d: any) => this.y(d.availableDocks));
        
        
        this.g.append("path")
        .datum(this.stations)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", this.line);
        console.log(this.smaData_1hour.length)
        
        //30-past 1 hr
        this.sma_blue = d3Shape.line()
        .x((d: any) => this.x(d.lastCommunicationTime))//d.loggingtime
        .y((d: any) => this.y(d.availableDocks_avg));
        this.g.append("path")
        .datum(this.smaData_1hour)
        .attr("fill", "none")
        .attr("class", "sma_blue")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", this.sma_blue);
        
        //720-past 24 hr       
        this.sma_red = d3Shape.line()
        .x((d: any) => this.x(d.lastCommunicationTime))//d.loggingtime
        .y((d: any) => this.y(d.availableDocks_avg));
        this.g.append("path")
        .datum(this.smaData_24hour)
        .attr("fill", "none")
        .attr("class", "sma_red")
        .attr("stroke", "Red")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", this.sma_red);
        
        let legend24 = this.svg.append('g')
        .attr('x', 20)
        .attr('y', 10)
        .attr('width', 18)
        .attr('height', 10)
        
        
        legend24.append('rect')
        .attr('x',20)
        .attr('y',5)
        .attr('width',18)
        .attr('height',10)
        .attr('fill','#FF0000');
        
        legend24.append('text')
        .attr('x', 40)
        .attr('y', 10)
        .attr('dy','0.32em')
        .text("SMA 24 Hour Data")
        
        
        legend24.append('rect')
        .attr('x',20)
        .attr('y',20)
        .attr('width',18)
        .attr('height',10)
        .attr('fill','steelblue');
        
        legend24.append('text')
        .attr('x',40)
        .attr('y',25)
        .attr('dy','0.32em')
        .text("SMA 1 Hour Data")

        legend24.append('rect')
        .attr('x',20)
        .attr('y',35)
        .attr('width',18)
        .attr('height',10)
        .attr('fill','green');
        
        legend24.append('text')
        .attr('x',40)
        .attr('y',40)
        .attr('dy','0.32em')
        .text("Real time line chart")

        
        this.SMAFunction('sma_blue')
        this.SMAFunction('sma_red')
        console.log("Reached Here");
        
        
    }
    
    
    
    
    
    
    
}
