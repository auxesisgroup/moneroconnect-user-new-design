import { Component } from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import { Router, ActivatedRoute, ParamMap,NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(
    private storage:LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ){
    //localStorage.setItem("MoneroAUXUserUrl","http://139.59.9.73:8000");//"http://192.168.0.116:8000/");
    // main "http://104.236.95.166:8000/" -->Masscryp
    // staging "httpf://139.59.156.145:8000/"

 
    //main   -->Moneroconnect
    //staging "http://198.199.75.214:8000"
    // main ssl https://moneroconnet-api.auxledger.org/
    this.storage.store("MoneroAUXUserUrl","https://moneroconnet-api.auxledger.org/");
  } 

  ngOnInit() {
    this.router.events
    .filter((event) => event instanceof NavigationEnd)
    .map(() => this.route)
    .map((route) => {
      while (route.firstChild) route = route.firstChild;
      return route;
    })
    .filter((route) => route.outlet === 'primary')
    .mergeMap((route) => route.data)
    .subscribe((event) => {
      // console.log(event['title']);
      this.titleService.setTitle(event['title']);
    });
    // .subscribe((event) => {
    //   console.log('NavigationEnd:', event);
    // });
  }
}
  