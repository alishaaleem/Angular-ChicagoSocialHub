
import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../places.service';
import { Place } from '../../place'
import { Station } from '../../station';


@Component({
  selector: 'app-alert-table',
  templateUrl: './alert-table.component.html',
  styleUrls: ['./alert-table.component.css']
})
export class AlertTableComponent implements OnInit {

  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'totalDocks', 'occupancy', 'is_renting', 'status']; //'lastCommunicationTime', 'latitude', 'longitude',
  private stationsList: Station[]
  private idList = []
  dispTable = false;
  count = 0;
  

  private fullnoOFDocks_50 = 0;
  private emptynoOFDocks_50 = 0;
  private fullnoOFDocks_90 = 0;
  private emptynoOFDocks_90 = 0;

  constructor(private placesService: PlacesService) { }
  
  ngOnInit() {
    this.stationsList = []
    this.placesService.getPlaces()
    .subscribe((data: Place[]) => {
      console.log(data)
      this.getStations(data)
    });
    
  }
  
  
  private getStations(places: Place[]){
    for(var i = 0; i < places.length; i++){
      this.placesService.findStations(places[i].name).subscribe((data: Station[]) => {
        console.log(data.length)

        for(var i = 0; i < data.length; i++){
          this.count++
          //console.log(this.count)
          this.populateTableData(data[i])
          if(this.count >= places.length * 3){
            this.dispTable = true;
          }
        }
      });
    }
  }
  
  
  private populateTableData(row){
    
    if ((+row.availableBikes / +row.totalDocks) * 100 > 50) {
      this.fullnoOFDocks_50++;
    }
    else{
      this.emptynoOFDocks_50++;
    }
    
    if ((+row.availableBikes / +row.totalDocks) * 100 > 90) {
      
      this.fullnoOFDocks_90++;
      // totalDocks=d.totalDocks;
      // availableDocks=d.availableDocks;
      // stationName=d.stationName;
      //d.stationName = d.stationName;
      //d.totalDocks = +d.totalDocks;
      
      
      row.alert="#FA5C5C"
      if(this.idList.indexOf(row.id) == -1){
        this.stationsList.push(row)
        this.idList.push(row.id)
      }
      //console.log(_this.stationValue);
      
    }
    
    else {
      
      this.emptynoOFDocks_90++;
      // totalDocks=d.totalDocks;
      // availableDocks=d.availableDocks;
      // d.stationName = d.stationName;
      // d.totalDocks = +d.totalDocks;
      row.alert="#ABA8A8"
      //console.log(this.idList)
      if(this.idList.indexOf(row.id) == -1){
        this.stationsList.push(row)
        this.idList.push(row.id)
      }
      
    }
    
    
    console.log(this.stationsList)
    //this.dispTable = true
    
  }
  

}
