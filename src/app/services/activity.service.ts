import { Injectable } from '@angular/core';
import { Http, Response, HttpModule }  from '@angular/http';
import 'rxjs/add/operator/map';
import  PouchDB from 'pouchdb';
import * as moment from 'moment';
import * as _ from 'lodash';
// import * as Raven from 'raven-js';
import * as html2canvas from 'html2canvas';
import {ServiceapiService} from './serviceapi.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params
@Injectable()
export class ActivityService {

  pdb2:any;

  constructor(
    public http:Http,
    public serviceapi:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.pdb2 = new PouchDB("http://45.55.211.36:5984/moneroconnect-listactivity/");
  }

  putActivityInPouch(component,fun,desc,notes){
    let id = this.serviceapi.retrieveFromLocal("MoneroAUXUserEmail");
    if(id == null || id == "" || id == undefined || !id){
      id = "Global-User";
    }
    let page = this.router.url;
    let func = fun;
    let description = desc;
    // console.log(id,page,func,description)
    this.letsDoActivity(component,id,page,func,description,notes);
  }

  letsDoActivity(component,id,page,func,description,notes){
    
    // this.http.get("https://freegeoip.net/json/")
    // .subscribe(
    //   d=>{
    //     // console.info(d)
    //     let dt = JSON.parse(JSON.stringify(d));
    //     let dt2 = JSON.parse(dt._body);
    //     // console.log(dt2,dt2.ip);
    //     // localStorage.setItem("dummyuserinfo",dt._body)
    //     this.serviceapi.saveToLocal("MoneroAUXMassAppUserInfo",dt._body);
    //     this.updateIssue(id,page,func,description,notes,priority);
    //     // this.getIP();
    //   },
    //   e=>{
    //     // console.log(e);
    //     this.updateIssue(id,page,func,description,notes,priority);
    //   }
    // )
    this.updateIssue(component,id,page,func,description,notes);
  }
  updateIssue(component,id,page,func,description,notes){

    let userinfo = JSON.parse(this.serviceapi.retrieveFromLocal("MoneroAUXMassAppUserInfo"));

    this.pdb2.get(id).then((arr) =>{
      // console.log("then1",arr);

      var list = arr.activitylist;
      var getcount = arr.activitycount;
      // console.log("issue",list);
      // if(list == null || list == undefined || list == ""){
      //   let d = [];
      //   d.push(list)
      //   let c = getcount+1;
      //   d.push({
      //     _id:'issue'+c,
      //     data:{
      //       tracker:'Issue tracker'+c+' in page',
      //       timestamp: new Date()
      //     }
      //   });
      //   arr.issuelist = d;
      //   arr.issuescount = c;
      //   return this.pdb.put(arr);  
      // }else{
        // console.log("else",list)
        let d = list; 
        let c = getcount+1;
        let aid ='activity'+c; 
        // d.push(list)
        d.push({
          _id:aid,
          data:{
            tracker:notes,
            timestamp: new Date(),
            ip:userinfo.ip,
            country:userinfo.country_name,
            city:userinfo.city,
            time_zone:userinfo.time_zone,
            latitude:userinfo.latitude,
            longitude:userinfo.longitude,
            page:page,
            schema:func,
            description:description,
            component:component
          },
          active:1,
          momento:moment().unix()
        });
        arr.activitylist = d;
        arr.activitycount = c;
        return this.pdb2.put(arr);
      // }
      
    })
    // .then( (configDoc) =>{
    //   // console.log("then",configDoc)
    //   // sweet, here is our configDoc
    // })
    .catch((err) =>{
      // console.log("catch",err)
      // handle any errors
      this.insertAtFirstEntry(component,id,page,func,description,notes);
    });
  }
  insertAtFirstEntry(component,id,page,func,description,notes){   
    let userinfo = JSON.parse(this.serviceapi.retrieveFromLocal("MoneroAUXMassAppUserInfo"));
    let aid = 'activity'+1;
    let doc = {
      _id:id,
      activitycount:1,
      activitylist:[{
        _id:aid,
        data:{
          tracker:notes,
          timestamp: new Date(),
          ip:userinfo.ip,
          country:userinfo.country_name,
          city:userinfo.city,
          time_zone:userinfo.time_zone,
          latitude:userinfo.latitude,
          longitude:userinfo.longitude,
          page:page,
          schema:func,
          description:description,
          component:component
        },
        active:1,
        momento:moment().unix()
      }]
    } 
    this.saveFirstEntry(doc);
  }
  saveFirstEntry(doc){
    this.pdb2.put(doc).then(
      d =>{
        // console.log(d,"recorded issued")
      }
    ).catch((e)=>{
      // console.info("inthen:",e)
      if(e.name == "conflict"){
        // console.log("im conflict","call another update")
      }else{
        // console.error("error",e)
      }
    });
  }
}
