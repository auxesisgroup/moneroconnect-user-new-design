import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params


import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import { SignupService } from '../services/signup.service';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { FbapiService } from '../services/fbapi.service';

@Component({
  selector: 'app-pageotp',
  templateUrl: './pageotp.component.html',
  styleUrls: ['./pageotp.component.css'],
  providers:[SignupService,FbapiService]
})
export class PageotpComponent implements OnInit {

  public otpno:string;
  public agreed:boolean;
  public errmsg;public sucmsg;
  //private toasterService: ToasterService;

  loadingimage:boolean = false;

  constructor(
    public signup:SignupService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    private sessionStorage:SessionStorageService,
    private fbapi:FbapiService
  ) {
    
   }

  ngOnInit() {
    let token = this.route.snapshot.paramMap.get("token");
    //console.log(token);
    //verify
    this.signup.verifyPageOtp(token)
    .then(
      (data)=>{
        let a = JSON.parse(JSON.stringify(data))
        if(a.status != true)
          this.router.navigate(["login"]);
      },
      (err)=>{
        //console.log(err);
        this.router.navigate(["login"]);
      }
    );

    this.loadAlert();
  }

  loadAlert(){
    //if success msg from login page
    let retrieve = this.signup.retrieveRouteMsgPass();
    if(retrieve != null){
      this.sucmsg = retrieve;
      setTimeout(()=>{
        // this.sucmsg = "";
        this.signup.removeRouteMsgPass();
      },4000);
    }
  }

  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  signINFBAuth(){
    //firebase auth
    let emailFB = this.signup.retrieveFromLocal("AUXUserEmail");
    let passwordFB = "tokenbazaar";
    //console.log(emailFB,passwordFB);
    this.fbapi.signup(emailFB,passwordFB);
    //firebase auth 
  }

  loggedInFBauth(){
    let email = this.signup.retrieveFromLocal("AUXUserEmail");
    let password = "tokenbazaar";
    // this.fbapi.login(email,password);
    this.fbapi.check(email,password);
  }

  signup_new_user(){
    let otp = this.otpno;
    let agree = this.agreed;
    // if(!agree){
    //   this.printmsg("You should agree to terms and condition");
    // }else 
    this.sucmsg = "";
    if(otp == "" || otp == null){
      this.printmsg("OTP must be at least 6 characters!");
    }else{ //Password does not match. Please try again!
      //console.log(agree+" "+otp);
      this.loadingimage = true;
      let email = this.storage.retrieve("AUXUserEmail");//localStorage.getItem("AUXUserEmail");
      //let pval = this.signup.findUserEmail(email);
      otp = otp.toString().trim();
      // console.log(email,"a-"+otp+"-b")

      this.signup.makeOtp(email,otp)
      .then(
        data =>{
          // console.log(data);//{kyc: "pending", code: 200, tnc: true}
          let res = JSON.parse(JSON.stringify(data));
          if(res.code == 200 && !res.token){//before signup
            //console.log("before signup")
            if(res.tnc == false){
              if(res.kyc == false){
                this.signINFBAuth();
                // this.sucmsg = "Otp is verified";
                // setTimeout(()=>{ 
                  // this.sucmsg = "";
                  let msgToPass = "Otp is verified";
                  this.signup.setRouteMsgPass(msgToPass);
                  this.router.navigate(["/terms",email]); 
                // },1000);
                // /**FBAuth */
                setTimeout(()=>{this.loggedInFBauth();},1000);
              }else{this.printmsg("Wrong OTP, please check the e-mail and try again.");}
            }else if(res.tnc == true && (res.kyc == true || res.kyc == "accepted" || res.kyc == "pending" || res.kyc == "rejected")){
              if(res.kyc == false){
                this.signup.saveToLocal("AUXHomeStatus","pending");
                // this.sucmsg = "Otp is verified but you did not uploaded documents for KYC detail. Submit in next section.";
                // setTimeout(()=>{ 
                  // this.sucmsg = ""; 
                  let msgToPass = "Otp is verified but you did not uploaded documents for KYC detail. Submit in next section.";
                  this.signup.setRouteMsgPass(msgToPass);               
                  this.signup.saveToLocal("AUXTNCStatus","done"); 
                  this.router.navigate(["/kyc"]); 
                // },4000);
                // /**FBAuth */
                setTimeout(()=>{this.loggedInFBauth();},1000);
              }else if(res.kyc == "accepted"){
                this.signup.saveToLocal("AUXHomeStatus","done");
                // this.sucmsg = "Otp is verified but your KYC is in pending stage.";
                // setTimeout(()=>{ 
                  // this.sucmsg = ""; 
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                  this.storage.store("AUXAuthLogin",true);
                  this.signup.saveToLocal("AUXKYCStatus","done");                
                  this.signup.saveToLocal("AUXTNCStatus","done"); 
                  this.signup.setUserSession(email,res.token); 
                  // this.router.navigate(["/home"]);
                  this.router.navigateByUrl("/home"); 
                // },4000);
                // /**FBAuth */
                this.loggedInFBauth();
              }else if(res.kyc == "pending"){
                this.signup.saveToLocal("AUXHomeStatus","pending");
                // this.sucmsg = "Otp is verified but your KYC is in pending stage.";
                // setTimeout(()=>{ 
                  // this.sucmsg = ""; 
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                  this.storage.store("AUXAuthLogin",true);
                  this.signup.saveToLocal("AUXKYCStatus","done");                
                  this.signup.saveToLocal("AUXTNCStatus","done");
                  this.signup.setUserSession(email,res.token);  
                  // this.router.navigate(["/home"]); 
                  this.router.navigateByUrl("/home");
                // },4000);
                // /**FBAuth */
                this.loggedInFBauth();
              }else if(res.kyc == "rejected"){
                this.signup.saveToLocal("AUXHomeStatus","rejected");                
                // this.sucmsg = "Otp is verified and your KYC detail has been rejected.";
                // setTimeout(()=>{ 
                  // this.sucmsg = "";
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.storage.store("AUXAuthLogin",true);
                this.signup.saveToLocal("AUXKYCStatus","done");                
                this.signup.saveToLocal("AUXTNCStatus","done"); 
                this.signup.setUserSession(email,res.token); 
                // this.router.navigate(["/home"]);  
                this.router.navigateByUrl("/home");
              // },4000);
                // /**FBAuth */
                this.loggedInFBauth();
              }else{
                this.printmsg("Wrong OTP, please check the e-mail and try again.");
              }
            }else{
              this.printmsg("Wrong OTP, please check the e-mail and try again.");
            }
          }else if(res.code == 200 && res.token){//after signup
            //console.log("after signup")
            if((res.tnc == true && (res.kyc == true || res.kyc == false))||(res.tnc == true && (res.kyc == "pending" || res.kyc == "accepted" || res.kyc == "rejected"))){
              // this.sucmsg = "Otp is verified, loading your asset...";
              // setTimeout(()=>{
                // this.sucmsg = "";
                  let msgToPass = "Welcome to MASS Cryp ICO Platform! Your login is successful.";
                  this.signup.setRouteMsgPass(msgToPass);
                this.signup.saveToLocal("AUXHomeUserToken",res.token); 
                if(res.kyc == false){ this.signup.saveToLocal("AUXHomeStatus","nokyc");  this.signup.saveToLocal("AUXKYCStatus","nokyc");  }
                if(res.kyc == true){ this.signup.saveToLocal("AUXHomeStatus","done"); this.signup.saveToLocal("AUXKYCStatus","done");       }          
                if(res.kyc == "accepted"){ this.signup.saveToLocal("AUXHomeStatus","done"); this.signup.saveToLocal("AUXKYCStatus","done");  }              
                if(res.kyc == "pending"){ this.signup.saveToLocal("AUXHomeStatus","pending");  this.signup.saveToLocal("AUXKYCStatus","pending"); }
                if(res.kyc == "rejected"){ this.signup.saveToLocal("AUXHomeStatus","rejected");  this.signup.saveToLocal("AUXKYCStatus","rejected"); }
                              
                this.signup.saveToLocal("AUXTNCStatus","done");   
                this.storage.store("AUXAuthLogin",true);
                this.signup.setUserSession(email,res.token);             
                // this.router.navigate(["/home"]); 
                this.router.navigateByUrl("/home");
                // /**FBAuth */
                this.loggedInFBauth();
              // },4000);
            }else if(res.tnc == false){
              // console.log("im going in false verifyotp")
              this.signup.saveToLocal("AUXHomeUserToken",res.token); 
              this.signINFBAuth();
              // this.sucmsg = "Otp is verified";
              // setTimeout(()=>{ 
                // this.sucmsg = "";
                  let msgToPass = "Otp is verified";
                  this.signup.setRouteMsgPass(msgToPass);
                this.router.navigate(["/terms",email]); 
              // },4000);
              // /**FBAuth */
              setTimeout(()=>{this.loggedInFBauth();},1000);
            }else{
              this.printmsg("Wrong OTP, please check the e-mail and try again.");
            }
          }else if(res.code == 400){
            this.printmsg("Wrong OTP, please check the e-mail and try again.");
          }else{
            this.printmsg("Wrong OTP, please check the e-mail and try again.");
          }
          this.loadingimage = false;
        },
        err => {  
          this.loadingimage = false;
          //console.log(err);
          this.printmsg("Wrong OTP, please check the e-mail and try again.");
        }
      ).catch(err => {  
        this.loadingimage = false;
        //console.log(err);
        this.printmsg("Wrong OTP, please check the e-mail and try again.");
      });
    }
  }

}
