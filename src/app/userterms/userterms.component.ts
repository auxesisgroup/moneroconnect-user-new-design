import { Component, OnInit } from '@angular/core';

import { SignupService } from '../services/signup.service';
import { ServiceapiService } from '../services/serviceapi.service';
import { PouchService } from '../services/pouch.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
@Component({
  selector: 'app-userterms',
  templateUrl: './userterms.component.html',
  styleUrls: ['./userterms.component.css'],
  providers:[SignupService,ServiceapiService,PouchService]
})
export class UsertermsComponent implements OnInit {

  name:string;
  terms:boolean;

  errmsg:any;
  sucmsg:any;

  email:any;
  loadingimage:boolean = false;

  referral:any;

  tnctext:any;

  mystyle1: any;
	myparams1: any;

  constructor(
    public signup:SignupService,
    public api:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    public pouchserv:PouchService
  ) { 
    // this.resolveText();
  }

  ngOnInit() {
    let token = this.route.snapshot.paramMap.get("token");
    //console.log(token);
    //console.log(this.signup.findUserEmail(token));
    //this.email = token;
    //verify
    this.signup.verifyPageOtp(token)
    .then(
      (data)=>{
        let a = JSON.parse(JSON.stringify(data))
        if(a.status != true){
          this.router.navigate(["login"]);
        }
      },
      (err)=>{
        //console.log(err);
        this.router.navigate(["login"]);
      }
    );

    let tnc = this.signup.retrieveFromLocal("MoneroAUXTNCStatus");
    if(tnc == "done"){
      this.router.navigate(["login"]);
    }

    this.loadAlert();
    this.loadParts();
  }

  loadParts(){
    this.mystyle1 = {
        'position': 'fixed',
        'width': '100%',
        'height': '100%',
        'z-index': -1,
        'top': 0,
        'left': 0,
        'right': 0,
        'bottom': 0,
    };

    this.myparams1 = {
          particles: {
              number: {
                  value: 100,
              },
              color: {
                  value: '#2a3b71'
              },
              shape: {
                  type: 'triangle',
              },
          }
    };
  }

  loadAlert(){
    //if success msg from login page
    let retrieve = this.signup.retrieveRouteMsgPass();
    if(retrieve != null){
      this.sucmsg = retrieve;
      setTimeout(()=>{
        this.sucmsg = "";
        this.signup.removeRouteMsgPass();
      },4000);
    }

    this.loadIfReferral();
  }

  loadIfReferral(){
    let referralid = this.signup.retrieveReferralId("MoneroAUXUserReferralID");
    if(referralid == "" || referralid == null || referralid == undefined || !referralid){
      this.referral = null;
    }else{
      this.referral = referralid;
    }
  }

  failmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2000);
  }

  token_verification(){
    if(!this.terms){
      this.failmsg("You should agree to terms and conditions");
    }else if(this.name == "" || this.name == null){
      this.failmsg("Name can not be left blank");
    }else{
      this.loadingimage = true;
      //this.sucmsg = ("I have written "+this.terms+" "+this.name);
      let a = {};
      let email = this.storage.retrieve("MoneroAUXUserEmail");
      //console.log(this.signup.findUserEmail(email));
      let name = this.name;
      let ref = this.referral;
      this.signup.makeTNC(name,email,ref)
      .then(
        (data)=>{
          this.signup.saveUsername("MoneroAUXMassUserName",name);
          let dat = JSON.parse(JSON.stringify(data));
          //console.log(dat);
          if(dat.code == 200){// && dat.status == "accepted"
            let t = dat.token;
            if(t!="" || t!= null || t!=undefined || t){  
              this.storage.store("MoneroAUXAuthLogin",true);
              this.signup.saveToLocal("MoneroAUXHomeUserToken",dat.token);
              this.signup.setUserSession(email,dat.token);
            }
            if(dat.tnc == true && dat.kyc == false){
              // this.sucmsg = "Just one step remain uplaod your KYC detail in next section.";//
              // setTimeout(()=>{
                // this.sucmsg = "";
                  // let msgToPass = "Just one step remain, upload your KYC detail submit below.";
                  // this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);                
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");  
              // },2500);
            }else{
              // this.sucmsg = "Loading your dashboard.";//
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to XMRC Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");
                this.router.navigate(["home"]);
                let t = dat.token;
                if(t!="" || t!= null || t!=undefined){  
                  this.storage.store("MoneroAUXAuthLogin",true);
                  this.signup.saveToLocal("MoneroAUXHomeUserToken",dat.token);
                  this.signup.setUserSession(email,dat.token);
                }
              // },2500);
            }
          }else if(dat.code == 400){
            let t = dat.token;
            if(t!="" || t!= null || t!=undefined || t){  
              this.storage.store("MoneroAUXAuthLogin",true);
              this.signup.saveToLocal("MoneroAUXHomeUserToken",dat.token);
              this.signup.setUserSession(email,dat.token);
            }
            if(dat.kyc == true){
              // this.sucmsg = "You have already submitted the KYC Details, now we redirecting to your dashboard.";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "KYC is waiting for administrator approval. You can continue buying XMRC Coins.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.kyc == false){
              //console.log("to kyc ");
              // this.sucmsg = "Successfully registered but your KYC detail is not submitted";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Successfully registered but your KYC detail is not submitted";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);                
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");
              // },2500);
            }else if(dat.kyc == "pending"){
              // this.sucmsg = "Your KYC details is in pending stage. You are navigating to your dashboard in few moment.";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to XMRC Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);  
                this.signup.saveToLocal("MoneroAUXKYCStatus","pending");               
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.kyc == "rejected"){
              // this.sucmsg  = "Your KYC details is rejected. You are navigating to your dashboard in few moment";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to XMRC Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["kyc"]);  
                this.signup.saveToLocal("MoneroAUXKYCStatus","rejected");               
                this.signup.saveToLocal("MoneroAUXTNCStatus","done");
                this.router.navigate(["home"]);
              // },2500);
            }else if(dat.error == "invalid_ref_id"){
              this.failmsg("Invalid Referral ID");   
            }else{
              this.failmsg("Unable to verify terms and condition");    
            }
            // if(dat.token){  
            //   this.storage.store("MoneroAUXAuthLogin",true);
            //   this.signup.saveToLocal("MoneroAUXHomeUserToken",dat.token);
            //   this.signup.setUserSession(email,dat.token);
            // }
          }else{
            this.failmsg("Unable to verify terms and condition");  
          }
          this.loadingimage = false;
        },
        (err)=>{
          this.loadingimage = false;
          //console.log(err);
          this.failmsg("Unable to verify terms and condition");
          this.pouchserv.putErrorInPouch("token_verification()","Response error in component "+"UsertermsComponent","'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
          
        }
      ).catch(e=>{
        this.loadingimage = false;
        this.failmsg("Network unavailable");
        this.pouchserv.putErrorInPouch("token_verification()","Catch throws error in component "+"UsertermsComponent","'Monerocryp' app the exception caught is "+JSON.stringify(e),2);
        
      });
    }
  }

  resolveText(){
    this.tnctext = "<h2>asdfsdf</h2><p>asdklfhdfhlkhkj</p>"
  }
}
