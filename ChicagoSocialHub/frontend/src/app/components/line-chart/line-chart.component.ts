
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
    selector: 'app-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.css']
})


export class LineChartComponent implements OnInit {
    title = 'Line Chart';
    public StationName;
    constructor(private PlacesService: PlacesService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute) 
    {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            console.log(params);
      
      this.hours = params.hours
            this.StationName = params.stationName;
      
            console.log(this.StationName);
          });
    }
    private margin = { top: 20, right: 20, bottom: 30, left: 100 };
    private width: number;
    private height: number;
    stations: Station[] = [];
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;
    private g: any;
private hours: any = 1
private granularityConst: any;
private interval = null;

    ngOnInit() {



        this.station_selected();
        this.interval = setInterval(()=>{this.show_line_chart(this.hours);},120000)

    }

    ngOnDestroy() {
        if(this.interval){
            clearInterval(this.interval)
        }
    }

    show_line_chart(hours) {
        //var hours = hours;
        this.hours = hours
        
        this.PlacesService.logstash_divvy_data(this.StationName, this.hours).subscribe(() => {


            this.station_selected();

        });

    }
    station_selected() {
        this.PlacesService
            .getLogstash_divvy_data()
            .subscribe((data: Station[]) => {
                this.stations = data;

                if (this.hours==1){
                    this.granularityConst=d3Time.timeMinute.every(2);
                }
                else if (this.hours==24){
                    this.granularityConst=d3Time.timeHour.every(1);
                }
                else if (this.hours==168){
                    this.granularityConst=d3Time.timeDay.every(1);
                }

                d3.selectAll("svg > *").remove();
                console.log("fetchStation_Selected:", data);
                this.svg = d3.select('svg');
                this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
                this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
                this.g = this.svg.append('g')
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
                    .text('totalDocks');

                this.line = d3Shape.line()
                    .x((d: any) => this.x(new Date(d.lastCommunicationTime.toString())))//d.loggingtime
                    .y((d: any) => this.y(d.availableDocks));




                this.g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("class", "line")
                    .attr("stroke", "green")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", this.line);


                console.log("Reached Here");


            });
    }//end of station selected
}