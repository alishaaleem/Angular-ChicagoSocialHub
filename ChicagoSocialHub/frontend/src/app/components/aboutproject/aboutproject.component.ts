import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-aboutproject',
  templateUrl: './aboutproject.component.html',
  styleUrls: ['./aboutproject.component.css']
})
export class AboutprojectComponent implements OnInit {
  images = [1, 2, 3].map(() => `https://picsum.photos/900/500?random&t=${Math.random()}`);
  constructor() { }

  ngOnInit() {
  }



}
