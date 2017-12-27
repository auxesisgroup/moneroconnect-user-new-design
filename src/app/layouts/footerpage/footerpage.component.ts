import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footerpage',
  templateUrl: './footerpage.component.html',
  styleUrls: ['./footerpage.component.css']
})
export class FooterpageComponent implements OnInit {

  year:any;

  constructor() { }

  ngOnInit() {
    this.year = new Date().getFullYear();
  }

}
