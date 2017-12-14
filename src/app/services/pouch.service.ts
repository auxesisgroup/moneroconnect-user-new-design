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
export class PouchService {

  pdb2:any;
  checkAppArr:any;

  constructor(
    public http:Http,
    public serviceapi:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.pdb2 = new PouchDB("http://45.55.211.36:5984/moneroconnect-list/");
  }

  storeIP(){
    this.http.get("https://freegeoip.net/json/")
    .subscribe(
      d=>{
        // console.info(d)
        let dt = JSON.parse(JSON.stringify(d));
        let dt2 = JSON.parse(dt._body);
        // console.log(dt2,dt2.ip);
        this.serviceapi.saveToLocal("AUXMassAppUserInfo",dt._body);
        // console.log(this.datastoreServ.retrieveFromLocal("IssuerAppUserInfo"));
      },
      e=>{
        // console.log(e);
        // this.handleError(e)
      }
    )
  }

  letsIssuing(id,page,func,description,notes,priority){
    this.http.get("https://freegeoip.net/json/")
    .subscribe(
      d=>{
        // console.info(d)
        let dt = JSON.parse(JSON.stringify(d));
        let dt2 = JSON.parse(dt._body);
        // console.log(dt2,dt2.ip);
        // localStorage.setItem("dummyuserinfo",dt._body)
        this.serviceapi.saveToLocal("AUXMassAppUserInfo",dt._body);
        this.updateIssue(id,page,func,description,notes,priority);
        // this.getIP();
      },
      e=>{
        // console.log(e);
        this.updateIssue(id,page,func,description,notes,priority);
      }
    )
  }
  updateIssue(id,page,func,description,notes,priority){

    let userinfo = JSON.parse(this.serviceapi.retrieveFromLocal("AUXMassAppUserInfo"));

    this.pdb2.get(id).then((arr) =>{
      // console.log("then1",arr);

      var list = arr.issuelist;
      var getcount = arr.issuescount;
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
        let issueid ='issue'+c; 
        // d.push(list)
        d.push({
          _id:issueid,
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
            priority:priority
          },
          momento:moment().unix()
        });
        arr.issuelist = d;
        arr.issuescount = c;
        this.saveinScreenCast(issueid,id);
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
      this.insertAtFirstEntry(id,page,func,description,notes,priority);
    });
  }
  insertAtFirstEntry(id,page,func,description,notes,priority){   
    let userinfo = JSON.parse(this.serviceapi.retrieveFromLocal("AUXMassAppUserInfo"));
    let issueid = 'issue'+1;
    let doc = {
      _id:id,
      issuescount:1,
      issuelist:[{
        _id:issueid,
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
          priority:priority
        },
        momento:moment().unix()
      }]
    }
    this.saveFirstEntry(doc);
    this.saveinScreenCast(issueid,id);
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

  saveinScreenCast(issueid,id){
    let castDB = new PouchDB("http://45.55.211.36:5984/moneroconnect-listissuesscreen/");
    html2canvas(document.body,{logging:false}).then((canvas)=>{
      // console.log(canvas);

      var getImage = canvas.toDataURL(); // default is png 
      // console.log(getImage)

      castDB.post({
        email:id,
        key:issueid,
        issueid:issueid,
        screen:getImage
      },(err,result)=>{
        if(err){
          // console.log("Screen not Captured")
        }else{
          // console.log("ScreenCaptured result:",result)
        }
      })
      .then(d=>{
        // console.log("ScreenCaptured:",d)
      });
    })
  }

  putErrorInPouch(fun,desc,notes,priority){
    let id = this.serviceapi.retrieveFromLocal("AUXUserEmail");
    if(id == null || id == "" || id == undefined || !id){
      id = "Global-User";
    }
    let page = this.router.url;
    let func = fun;
    let description = desc;
    // console.log(id,page,func,description)
    this.letsIssuing(id,page,func,description,notes,priority);
  }
}
