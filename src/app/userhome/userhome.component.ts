import { Component,ElementRef, OnInit, Renderer2, ViewChild,Input,SimpleChanges, TemplateRef } from '@angular/core';

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { Router, ActivatedRoute, ParamMap,NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params


import * as moment from 'moment';
import _ from 'lodash';

import * as Chart from 'chart.js';

import { FbapiService } from '../services/fbapi.service';

import { PouchService } from '../services/pouch.service';
import { ActivityService } from '../services/activity.service';

import { CookieService } from 'ngx-cookie-service';//
@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css'],
  providers:[ServiceapiService,SignupService,PouchService,ActivityService]
})
export class UserhomeComponent implements OnInit {

  public apiMethod:string;
  public collapsed:boolean = true;

  public optradio:string;
  public cas:any;

  public homeStatusDone:boolean = true;
  public homeStatusYet:boolean = false;
  public homeStatusYetText:string = "";

  public user_timeline_list:any = [];
  public user_timeline_listShow:boolean = false;

  public qrvalue:any;

  loadingimage:boolean = false;

  radioclick:string = 'btc';
  userchk:any;
  ok:any = "parent";
  timestamp:string = "timestamp";
  reverse:boolean = true;

  kycalertpanel:number;kycalertpanelview:boolean;

  tokens:any;

  starterDisableButton:boolean = false;
  current_rate:any;

  public ngxloading = false;

  public showChart:boolean = false;
  public lineChartData:Array<any>;
  public lineChartLabels:Array<any>;
  public jsonData:any;


  csvFiles:File;
  csvData:any;

  constructor(
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private sessionStorage:SessionStorageService,
    private toastr: ToastrService,
    public signup:SignupService,
    public element:ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,//
    private fbapi:FbapiService,
    public pouchserv:PouchService,
    public activityServ:ActivityService
  ) {
    this.qrvalue = "Its Demo For QR Angular";
    //this.signup.setUserSession(this.storage.retrieve("MoneroAUXUserEmail"),"7764611b-fdee-4804-8f2f-fab678e63526a704b8ef-5cb5-45b1-b367-98c89b91f1aeba1abd08-0b64-4f05-8d60-a049344a1a28");

    this.serv.callCSV();
  }

  

  keyevent(evt){
       var charCode = (evt.which) ? evt.which : evt.keyCode;
       if (charCode != 46 && charCode > 31 
         && (charCode < 48 || charCode > 57) ){
           //let cs = (this.cas).toString();
           //cs = cs.substr(0,cs.length-1);
          //this.cas = cs;
          return false; 
        }
        if(charCode === 46 || charCode === 190 ){
          return false;
        }
        //this.cas = parseFloat(this.cas); 
        //console.log(this.cas,evt)
       return true;
  }
  keyup(evt){
    let cas = this.cas;//(this.cas).toString();
    let s = cas.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/);
    // console.log(this.cas,cas,s,evt)
    this.signup.saveToLocal("MoneroAUXsavelocalamount",this.cas);
    // console.log(this.cas,this.serv.retrieveFromLocal("MoneroAUXsavelocalamount"))
  }


  callToViewModalBtn(optradio){
    if(optradio == 'btc'){
      this.radioclick = 'btc';
    }else if(optradio== 'eth'){
      this.radioclick = 'eth';
    }else if(optradio == 'bnk'){
      this.radioclick = 'bnk';
    }else{
      this.radioclick = 'btc';
    }
    this.signup.saveToLocal("MoneroAUXsavelocalpaytype",optradio);
    this.activityServ.putActivityInPouch("UserhomeComponent","callToViewModalBtn()","Attempt to buy XMRC token for "+this.radioclick,"");
    
    //console.log(optradio,this.radioclick,this.serv.retrieveFromLocal("MoneroAUXsavelocalpaytype"))
  }
  loggedInFBauth(){
    let email = this.signup.retrieveFromLocal("MoneroAUXUserEmail");
    let password = "tokenbazaar";
    // console.log("fb,",email,password);
    this.fbapi.login(email,password);
    // this.fbapi.signup(email,password);  
    // this.fbapi.check(email,password);

    let d = this.fbapi.retrieve();
    console.log(d)
  } 

  ngOnInit() {
    // this.router.events.subscribe((evt) => {
    //     if (!(evt instanceof NavigationEnd)) {
    //         return;
    //     }
    //     document.body.scrollTop = 0;
    // }); 
    // this.loggedInFBauth();
    this.ngxloading = true; //initialize loader

    this.loadHomeStatus();
    
    this.signup.saveToLocal("MoneroAUXPageChange","no");

    
    
    this.starterDisableButton = true;
    this.storage.store("MoneroAUXstarterSecretButton","yes");

    // let f = 0.021239966675122334;
    // console.log(f);
    // // let f1 = f.toPrecision(6);
    // // console.log(f1,Math.floor(parseFloat(f1)))
    // // let f2 = f.toFixed(6);
    // // console.log(f2,Math.floor(parseFloat(f2)))
    // console.log(this.roundUp(f, 1000000));

    // let a = this.calcsubstr(25.451478012875654);
    // console.log(a)

   this.signup.checkActivity();
   
  }
  roundUp(num, precision) {
    return Math.ceil(num * precision) / precision
  }
  
  

  ngDoCheck(){
    let take = this.signup.retrieveFromLocal("MoneroAUXPageChange");
    // console.log(take)
    if(take=="yes"){
      // console.log("2:",take)
      this.optradio = "";
      this.cas = "";
      setTimeout(()=>{this.signup.saveToLocal("MoneroAUXPageChange","no");},600);
      this.loadHomeData();
    }
  }

  loadAlert(){
    let msg;
    let seen = this.signup.retrieveFromLocal("MoneroAUXHomeNGXSeen");
    //console.log(seen)
    if(seen == "seen"){ 
      //if success msg from login page
      let retrieve = this.signup.retrieveRouteMsgPass();
      if(retrieve != null){
        msg = retrieve;
        this.toastr.success(msg, null,{timeOut:5000});
        setTimeout(()=>{
          msg = "";
          this.signup.removeRouteMsgPass();
        },4000);
      }
    }else{
      this.signup.saveToLocal("MoneroAUXHomeNGXSeen","seen");
      let retrieve = this.signup.retrieveRouteMsgPass();
      setTimeout(()=>{
        if(retrieve != null){
          msg = retrieve;
          this.toastr.success(msg,null,{timeOut:5000});
          setTimeout(()=>{
            msg = "";
            this.signup.removeRouteMsgPass();
          },4000);
        }
        // this.toastr.success('Token bazaar with ease!', 'Welcome!!!',{timeOut:5000});
      },500);
    }
    
  }

  callme(){
    // console.log("called")
    setTimeout(()=>{
          this.apiMethod = "dashboard";
          let data = {
            'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
            'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
          }; 
          this.serv.resolveApi(this.apiMethod,data) 
          .subscribe(
            res=>{
              let d = JSON.parse(JSON.stringify(res));
              if(d.status == 200){
               if(d.user_timeline_list == "" || d.user_timeline_list == null){
                  this.user_timeline_listShow = false;
                }else{
                  let a = d.user_timeline_list;
                  let b = [];
                  _.forEach(a,(value,key)=>{
                    let x;let y;
                    if(value.currency == 'btc' && value.type != 'payment_initiation'){
                      let s = value.content;
                      let s1 = s.split(",");
                      // console.log(s1)
                      let s1_1 = (s1[0].trim()).replace('btc','');
                      let s1_2 = (s1[1].trim()).replace('tokens','');
                      // console.log(s1_1,s1_2)
                      // x = s1_1;y=s1_2;
                      x = this.signup.calcsubstr(s1_1);y=s1_2;
                    }
                    if(value.currency == 'eth' && value.type != 'payment_initiation'){
                      let s = value.content;
                      let s1 = s.split(",");
                      // console.log(s1)
                      let s1_1 = (s1[0].trim()).replace('eth','');
                      let s1_2 = (s1[1].trim()).replace('tokens','');
                      // console.log(s1_1,s1_2)
                      // x = s1_1;y=s1_2;
                      x = this.signup.calcsubstr(s1_1);y=s1_2;
                    }
                    let content2 = value.content;
                    if(value.type == 'payment_initiation'){
                      if(value.currency == 'btc'){
                        let s = value.content;
                        let s1 = s.split(",");
                        let s1_1 = (s1[0].trim()).replace('btc','');
                        content2 = this.signup.calcsubstr(s1_1)+' BTC';
                      }
                      if(value.currency == 'eth'){
                        let s = value.content;
                        let s1 = s.split(",");
                        let s1_2 = (s1[0].trim()).replace('eth','');
                        content2 = this.signup.calcsubstr(s1_2)+' ETH';
                      }
                    }
                    b.push({
                      amount_to_pay:value.amount_to_pay,
                      content:value.content,
                      content2:content2,
                      currency:value.currency,
                      email:value.email,
                      erc_address:value.erc_address,
                      rate:value.rate,
                      timestamp:value.timestamp,
                      token_amount:value.token_amount,
                      type:value.type,
                      mass:y,
                      amount:x
                    })
                  })
                  this.user_timeline_list = b;
                  this.tokens = d.tokens;
                }
              }else if(d.code == 401){
                // this.signup.logoutFromApp();
                this.user_timeline_list = [];
              }else{
                this.user_timeline_list = [];
              } 
            },
            err=>{ 
              this.user_timeline_listShow = false;
            }
          );
    },5000);
  }

  loadHomeStatus(){
    let isAuth = this.storage.retrieve("MoneroAUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    // console.log("isAuthorized",isAuth,cookieExists);
    if(isAuth == null){
      this.ngxloading = false; 
      this.signup.UnAuthlogoutFromApp(); 
    }
    else if(cookieExists == false){
      this.ngxloading = false; 
      this.storage.store("MoneroAUXAuthLogin",false);
      this.signup.UnAuthlogoutFromApp();
    }
    else{
      let status = this.signup.retrieveFromLocal("MoneroAUXHomeStatus");
      //console.log(status)
      this.storage.clear("MoneroAUXsavelocalamount");
      this.storage.clear("MoneroAUXsavelocalpaytype");
      if(status == "nokyc" || status == "done" || status == "pending" || status == "rejected" || status == false || status == true || status == "accepted"){
        this.homeStatusDone = true;
        this.homeStatusYet = false;
        this.user_timeline_listShow = true;
        // let seen = this.signup.retrieveFromLocal("MoneroAUXHomeNGXSeen");
        // //console.log(seen)
        // if(seen == "seen"){ 
        //   //do not open toastr
        // }else{
        //   this.signup.saveToLocal("MoneroAUXHomeNGXSeen","seen");
        //   setTimeout(()=>{this.toastr.success('Token bazaar with ease!', 'Welcome!!!',{timeOut:5000});},1000);
        // }
        this.loadAlert();
        if(status == "nokyc"){
          this.viewAlways(0);
        }else if(status == "done"){
          this.viewAlways(1);
        }else if(status == "pending"){
          this.viewAlways(2);
        }else if(status == "rejected"){
          this.viewAlways(3);
        }else if(status == false){
          this.viewAlways(0);
        }else if(status == true){
          this.viewAlways(1);
        }else if(status == "accepted"){
          this.viewAlways(1);
        }else{
          //console.log("do nothing")  
        }
      }else{
        //this.signup.logoutFromApp();
        //console.log("don nothing")
      }
      this.loadHomeData();
    }
  }

  callAgainForStatus(){
    let status = this.signup.retrieveFromLocal("MoneroAUXHomeStatus");
    //console.log(status)
    if(status == "nokyc" || status == "done" || status == "pending" || status == "rejected" || status == false || status == true || status == "accepted"){
      if(status == "nokyc"){
        this.viewAlways(0);
      }else if(status == "done"){
        this.viewAlways(1);
      }else if(status == "pending"){
        this.viewAlways(2);
      }else if(status == "rejected"){
        this.viewAlways(3);
      }else if(status == false){
        this.viewAlways(0);
      }else if(status == true){
        this.viewAlways(1);
      }else if(status == "accepted"){
        this.viewAlways(1);
      }else{
       // console.log("do nothing")  
      }
    }else{
      //this.signup.logoutFromApp();
      //console.log("don nothing")
    }
  }
  viewAlways(view){
    let a = this.serv.retrieveFromLocal("MoneroAUXKYCDetailSeenAlways");
    //console.log(a)
    if(a || a == "seen"){
      // console.log("Do nothing bcoze one seen success msg of seen")
    }else{ 
      if( view == 1 ){
        this.kycalertpanelview = true;
        this.kycalertpanel = view;
        this.serv.saveToLocal("MoneroAUXKYCDetailSeenAlways","seen");
        setTimeout(()=>{
            this.kycalertpanelview = false;
        },8000);
      }else{
        this.kycalertpanelview = true; 
        this.kycalertpanel = view; 
      }
    }
  }

  loadHomeData(){
    
    // if(this.current_rate !="" || this.current_rate != undefined || this.current_rate != null){
    //   this.makeChart(this.current_rate);
    // }

    this.apiMethod = "dashboard";
    
        let data = {
          'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
          'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
        };
        setTimeout(()=>{
          // console.log(data,"called");
          // this.loggedInFBauth();
        },1000);
        this.serv.resolveApi(this.apiMethod,data) 
        .subscribe(
          res=>{
            this.ngxloading = false; 
            // console.log(res);
            let d = JSON.parse(JSON.stringify(res));
            if(d.status == 200){
              
              //sold tokens
              this.serv.resolveApi("get_total_tokens_sold",{}) 
              .subscribe(
                res=>{
                  let d = JSON.parse(JSON.stringify(res));
                  this.current_rate = d.current_rate;
                  this.makeChart(this.current_rate);
                },
                err=>{ 
                  console.error(err);
                }
              );
              // this.putErrorInPouch("loadHomeData()","Response in component "+this.constructor.name,"'Moneroconnect' app the exception caught is "+JSON.stringify(res),1);
              

              this.signup.saveUsername("MoneroAUXMassUserName",d.user_name);
              let kyc = d.kyc;  
              if(kyc == false)  this.serv.saveToLocal("MoneroAUXHomeStatus","nokyc");
              if(kyc == null)  this.serv.saveToLocal("MoneroAUXHomeStatus","nokyc");
              if(kyc == "pending")  this.serv.saveToLocal("MoneroAUXHomeStatus","pending");
              if(kyc == "rejected")  this.serv.saveToLocal("MoneroAUXHomeStatus","rejected");
              // if(kyc == true)  {this.serv.saveToLocal("MoneroAUXHomeStatus","done");}
              if(kyc == "accepted") { this.serv.saveToLocal("MoneroAUXHomeStatus","done");}
               
              // this.user_timeline_list = d.user_timeline_list;
              if(d.user_timeline_list == "" || d.user_timeline_list == null){
                this.user_timeline_listShow = false;
              }else{
                let first = d.user_timeline_list;
                let take = _.first(first,15);
                let a = d.user_timeline_list;//[];
                //console.log(a)
                // _.forEach(first,function(value,key) {
                //   console.log(value,key)
                //   if(key<15){
                //     console.log(value)
                //     a.push(value);
                //   }
                // });
                this.tokens = d.tokens;

                // 
                

                let b = [];
                _.forEach(a,(value,key)=>{
                  let x;let y;
                  if(value.currency == 'btc' && value.type != 'payment_initiation'){
                    let s = value.content;
                    let s1 = s.split(",");
                    // console.log(s1)
                    let s1_1 = (s1[0].trim()).replace('btc','');
                    let s1_2 = (s1[1].trim()).replace('tokens','');
                    // console.log(s1_1,s1_2)
                    // x = s1_1;y=s1_2;
                    x = this.signup.calcsubstr(s1_1);y=s1_2;
                  }
                  if(value.currency == 'eth' && value.type != 'payment_initiation'){
                    let s = value.content;
                    let s1 = s.split(",");
                    // console.log(s1)
                    let s1_1 = (s1[0].trim()).replace('eth','');
                    let s1_2 = (s1[1].trim()).replace('tokens','');
                    // console.log(s1_1,s1_2)
                    // x = s1_1;y=s1_2;
                    x = this.signup.calcsubstr(s1_1);y=s1_2;
                  }
                  let content2 = value.content;
                  if(value.type == 'payment_initiation'){
                    if(value.currency == 'btc'){
                      let s = value.content;
                      let s1 = s.split(",");
                      let s1_1 = (s1[0].trim()).replace('btc','');
                      content2 = this.signup.calcsubstr(s1_1)+' BTC';
                    }
                    if(value.currency == 'eth'){
                      let s = value.content;
                      let s1 = s.split(",");
                      // console.log(s1)
                      let s1_2 = (s1[0].trim()).replace('eth','');
                      // console.log(s1_2)
                      content2 = this.signup.calcsubstr(s1_2)+' ETH';
                    }
                  }
                  b.push({
                    amount_to_pay:value.amount_to_pay,
                    content:value.content,
                    content2:content2,
                    currency:value.currency,
                    email:value.email,
                    erc_address:value.erc_address,
                    rate:value.rate,
                    timestamp:value.timestamp,
                    token_amount:value.token_amount,
                    type:value.type,
                    mass:y,
                    amount:x
                  })
                })
                this.user_timeline_list = b;
                //this.user_timeline_listShow = true;
                // if(this.homeStatusDone == true){
                //   this.user_timeline_listShow = true;
                // }else{
                //   this.user_timeline_listShow = false;
                // }
              }
              this.callAgainForStatus();
            }else if(d.code == 401){
              this.user_timeline_list = [];
              this.signup.logoutFromApp();
            }else{
              this.user_timeline_list = [];
            } 
          },
          err=>{ 
            this.ngxloading = false; 
            this.user_timeline_listShow = false;
            //console.error(err);
            this.putErrorInPouch("loadHomeData()","Response error in component UserhomeComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
            
          }
        );
  }

  convertToDate(timestamp){
    let date = moment.unix(timestamp).fromNow();//.format("MMM Do, YYYY");
    return date;
  }


  //Charts
  // lineChart
  public makeChart(Currentrate){
    this.serv.retrieveRateListFromJSON()
    .subscribe(
      (d)=>{
        // console.log(d)
        let data = JSON.parse(JSON.stringify(d));
        // console.log(data[2].data);
        this.jsonData = data[2].data;

        // console.info(Currentrate,this.jsonData)

        let takeRight = _.takeWhile(this.jsonData, function(o) { if(o.PriceinUSD <= parseFloat(Currentrate)) return o; });
        let lastEl = takeRight.slice(Math.max(takeRight.length - 20, 0));
        
        // console.log(takeRight)

        // console.log(lastEl)

        // console.log(lastEl[0].PriceinUSD,(parseFloat(lastEl[0].PriceinUSD)-0.005))

        let initialiAmnt = (parseFloat(lastEl[0].PriceinUSD)-0.005);

        let initialiAmnt2 = initialiAmnt;
        let a = [];let dum = [];let b = [];
        _.forEach(lastEl,(value,key)=>{
          //for price
          let ab = _.pick(value,['PriceinUSD'])
          dum.push((_.get(ab,'PriceinUSD')));
          a.push((_.get(ab,'PriceinUSD')))

          //for token
          let bb = _.pick(value,['Torange'])
          let s = (_.get(bb,'Torange')).trim()+"";
          b.push(s);
        });
        let maxa = _.max(dum);
        let ev = (parseFloat(maxa)+0.005);
        // console.log(ev)
        let evExtra = ev;
        // a.push(evExtra);
        b.push("");
        // console.log(a)
        // console.log(b)

        let a1 = [];
        _.forEach(a,(v,k)=>{
          a1.push("$"+v);
        })

        // console.log(a1)
        

        // Chart.pluginService.register({
        //   afterUpdate: (chart)=> {
        //       // We get the dataset and set the offset here
        //       var dataset = chart.config.data.datasets[0];
        //       var offset = 20;
      
        //       // For every data in the dataset ...
        //       for (var i = 0; i < dataset._meta[0].data.length; i++) {
        //           // We get the model linked to this data
        //           var model = dataset._meta[0].data[i]._model;
      
        //           // And add the offset to the `x` property
        //           model.x += offset;
        //           // model.y += offset;
      
        //           // .. and also to these two properties
        //           // to make the bezier curve fits the new graph
        //           model.controlPointNextX += offset;
        //           model.controlPointPreviousX += offset;

        //           // model.controlPointNextY += offset;
        //           // model.controlPointPreviousY += offset;
        //       }
        //   }
        // });

        this.lineChartData = [
          {   data: a, label: 'Rate ',
              // borderWidth: 2,
              fill: false,
              // lineTension: .3,pointHoverBorderWidth: 2,
              // pointRadius: 4,
              // pointHitRadius: 10,
              // spanGaps: false,
          }
        ];
        this.lineChartLabels = b;

        

        this.showChart = true;
      },
      (e)=>{
        // console.error(e)
        this.showChart = false;
        this.putErrorInPouch("makeChart()","Response error in component "+" UserhomeComponent ","'Moneroconnect' app the exception caught is "+JSON.stringify(e),1);
        
      }
    );
    

    // this.randomize();
  }
  
  public lineChartOptions:any = {
    responsive: true,
    title: {
        display: true,
        text: 'Rates vs Sold Tokens'
    },
    // ticks: {
    //   labelOffset: 1
    // },
    scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Sold Tokens",
            fontColor: "green",
            // zeroLineWidth:1
          },
          gridLines: {
            offsetGridLines: true,
            display: false,
            borderDash: [6, 2],
            tickMarkLength:5
          },
          ticks: {
            // fontSize: 8,
            // labelOffset: 15,
            // maxRotation: 0,
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Token Rate In USD",
            fontColor: "green",
            // zeroLineWidth:1
          },
          ticks:{
            // beginAtZero: false,
          }
        }]
    }
  };
  public lineChartColors:Array<any> = [
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
 
  // public randomize():void {
  //   let _lineChartData:Array<any> = new Array(this.lineChartData.length);
  //   for (let i = 0; i < this.lineChartData.length; i++) {
  //     _lineChartData[i] = {data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label};
  //     for (let j = 0; j < this.lineChartData[i].data.length; j++) {
  //       _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
  //     }
  //   }
  //   this.lineChartData = _lineChartData;
  // }
 
  // events
  public chartClicked(e:any):void {
    // console.log(e);
  }
 
  public chartHovered(e:any):void {
    // console.log(e);
  }

  putErrorInPouch(fun,desc,notes,priority){
    let id = this.serv.retrieveFromLocal("MoneroAUXUserEmail");
    let page = this.router.url;
    let func = fun;
    let description = desc;
    // console.log(id,page,func,description)
    this.pouchserv.letsIssuing(id,page,func,description,notes,priority);
  }
}