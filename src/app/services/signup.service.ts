import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { FbapiService } from './fbapi.service';


import { CookieService } from 'ngx-cookie-service';
@Injectable()
export class SignupService {

  private url:string;

  headers: Headers;
  options: RequestOptions;

  private name;
  private age;
  private address;

  interval:any;
  
  constructor(
    public http:Http,
    private storage:LocalStorageService,
    private sessionStorage:SessionStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private fbapi:FbapiService,
    private cookieService:CookieService
  ) { 
    this.url = this.storage.retrieve("MoneroAUXUserUrl");//localStorage.getItem("MoneroAUXUserUrl");

    this.headers = new Headers({ 
      'Content-Type': 'application/json', 
      'Accept': 'q=0.8;application/json;q=0.9' 
    });
    this.options = new RequestOptions({ headers: this.headers });

    //console.log(this.fbapi.testit());
    // this.proto.prototype.address = "Mumbai";
    // let a  = new this.proto;
    // console.log(a.address);
    
    // let cookieExists = this.checkUserActivity();
    // // console.log("isAuthorized",isAuth,cookieExists);
    // if(cookieExists == false || !cookieExists){
    //   console.log("false")
    //   this.storage.store("MoneroAUXAuthLogin",false);
    //   this.UnAuthlogoutFromApp();
    // }
  }

  ////////////////////////////////////////////////Demo////////////////////////
  demo(){
    return new Promise((resolve,reject)=>{
      this.http.get('https://freegeoip.net/json/')
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }
  proto(){
    this.name = "ABCD";
    this.age = 25;
  }
  getService(url: string): Observable<any> {
    return this.http
      .get(url)
      .map(this.extractData);
      //.catch(this.handleError);
  }
  private extractData(res: Response) {
      let body = res.json();
      return body || {};
  }
  private handleError(error: any) {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      // console.error(errMsg);
      return Observable.throw(errMsg);
  }
  //////////////////////////////////////////////////Demo//////////////////////

  makeFirstCall(){
    let secureStr = (Math.floor((Math.random() * 100000000) + 1)).toString();
    let token = sha512(secureStr);

    let cached:Boolean = this.cookieService.check("MoneroAUXUserCookieServe");
    if(cached){
      //console.log("im retrive cookie")
      token = this.cookieService.get("MoneroAUXUsersecureLocalTokenAuth");
      this.storage.store('secureLocalTokenAuth', token);
    }else{
      this.storage.store('secureLocalTokenAuth', token);
    }
    //this.saveToLocal("MoneroAUXUserEmail","jitendra@auxesisgroup.com");
    //console.log(token);

    // let a = CryptoJS.AES.encrypt("Message",token);
    // console.log(a);
    // this.storage.store("name",a.toString());
    // let b = CryptoJS.AES.decrypt(a,mm);
    // console.log(b);
    // let c = b.toString(CryptoJS.enc.Utf8);
    // console.log(c);
  }
  
  setRouteMsgPass(msg){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let storeStr = (CryptoJS.AES.encrypt(msg,token)).toString();
    this.sessionStorage.store("MoneroAUXRouteMsgPass",storeStr);
  }

  retrieveRouteMsgPass(){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.sessionStorage.retrieve("MoneroAUXRouteMsgPass");
    if(fromStorage == "" || fromStorage == null || !fromStorage){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  removeRouteMsgPass(){
    this.sessionStorage.clear("MoneroAUXRouteMsgPass");
  }

  saveReferralId(name,str){
    let token = "Referral-Key-For-User";
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    // this.storage.store(name,storeStr);
    this.cookieService.set(name,storeStr);
  }

  retrieveReferralId(name){
    let token = "Referral-Key-For-User";
    let fromStorage = this.cookieService.get(name);
    if(fromStorage == "" || fromStorage == null){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  saveRefundAddress(name,str){
    let token = "Refund-Address-For-User";
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    this.storage.store(name,storeStr);
    var today = new Date();
    var expiresValue = new Date(today);
    expiresValue.setHours(today.getHours() + 24*30);
    this.cookieService.set(name,storeStr,expiresValue);
  }

  retrieveRefundAddress(name){
    let token = "Refund-Address-For-User";
    let fromStorage = this.cookieService.get(name);    
    if(fromStorage == "" || fromStorage == null){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  retrieveRefundAddressFromLocal(name){
    let token = "Refund-Address-For-User";
    let fromStorage = this.storage.retrieve(name);   
    if(fromStorage == "" || fromStorage == null){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }


  // username
  saveUsername(name,str){
    let token = "XMRC-Token-For-User";
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    this.storage.store(name,storeStr);
    var today = new Date();
    var expiresValue = new Date(today);
    expiresValue.setHours(today.getHours() + 24*30);
    this.cookieService.set(name,storeStr,expiresValue);
  }

  retrieveUsername(name){
    let token = "XMRC-Token-For-User";
    let fromStorage = this.cookieService.get(name);    
    if(fromStorage == "" || fromStorage == null){
      return "there!";
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  saveToLocal(name,str){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    //console.log(token)
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    //console.log(storeStr)
    this.storage.store(name,storeStr);
  }

  retrieveFromLocal(name):any{
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.storage.retrieve(name);
    //console.log(fromStorage)
    if(fromStorage == "" || fromStorage == null){
      return "";
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  verifyPageOtp(token){
    let auth = this.storage.retrieve("secureLocalTokenAuth");
    let verifyWith = this.storage.retrieve("MoneroAUXUserEmail");
    return new Promise((resolve,reject)=>{
      if(verifyWith==token){
        resolve({"status":true});
      }else{
        reject({"status":false});
      }
    });
  }

  findUserEmail(email){
    //console.log(email)
    let token = (this.storage.retrieve("secureLocalTokenAuth")).toString();
    //console.log(token)
    let getDecrypt = CryptoJS.AES.decrypt(email,token);
    let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
    return finalStr;
  }

  findUserEmail2(email){
    // console.log(email)
    let token = (this.storage.retrieve("secureLocalTokenAuth")).toString();
    // console.log(token)
    let getDecrypt = (CryptoJS.AES.decrypt(email,token)).toString();
    alert(getDecrypt);
    let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
    // console.log(finalStr)
    return email;
  }

  makeSignup(email){
    let data = JSON.stringify({email:email});
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"sign_up/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeOtp(email,otp){
    email = this.findUserEmail(email);//get encrypted email
    let data = JSON.stringify({email:email,otp:otp});
    //console.log(data);
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"verify_otp/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeTNC(name,email,refid){
    //console.log(email);
    let email2 = localStorage.getItem("MoneroAUXUserEmailLocal");//this.findUserEmail(email);//get encrypted email
    let data;
    if(refid == "" || refid == null || refid == undefined || !refid){
      data = JSON.stringify({name:name,email:email2,ref_id:refid});
    }
    else{
      data = JSON.stringify({name:name,email:email2,ref_id:refid});
    } 
    // console.log(data);
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"tnc/",data)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeKYC(data){
    let a = JSON.stringify(data);
    //console.log(JSON.parse(a));
    return new Promise((resolve,reject)=>{
      this.http.post(this.url+"kyc/",a)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      },err=>{
        reject(err);
      });
    });
  }

  makeApiCall(api:string):Observable<any>{
    return this.http
            .post(this.url+api,{})
            .map(this.extractData);
  }

  UnAuthlogoutFromApp(){
    let url = this.storage.retrieve("MoneroAUXUserUrl");
    this.storage.clear();
    localStorage.clear();
    this.fbapi.logout();
    this.storage.store("MoneroAUXUserUrl",url);
    this.router.navigate(["/login","you_are_unauthorized"]);
    location.reload();
    this.clearUserSession(); 
    //this.router.navigateByUrl("/login?why=you_are_unauthorized");
  }
 
  logoutFromApp(){
    clearInterval(this.interval);
    let url = this.storage.retrieve("MoneroAUXUserUrl");
    this.storage.clear();
    localStorage.clear();
    this.fbapi.logout();
    this.storage.store("MoneroAUXUserUrl",url);
    this.router.navigate(["/login"]);
    // location.reload();
    this.clearUserSession();
  }

  setUserSession(email,token){
    
    let id = sha512(email);
    this.sessionStorage.store("MoneroAUXUserSessionID",id);
    this.sessionStorage.store("MoneroAUXUserSessionValue",email);
    this.sessionStorage.store("MoneroAUXUserSessionToken",token);
 
    var today = new Date();
    var expiresValue = new Date(today);
    // expiresValue.setSeconds(today.getSeconds() + 15); 
    expiresValue.setHours(today.getHours() + 1*1); 
    //expiresValue.setMinutes(today.getMinutes() + 1); 
    //console.log(today,'\n',expiresValue)
    this.cookieService.set( 'AUXUserCookieServe', token,expiresValue);

  } 

  saveCacheEmail(email){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    var today = new Date();
    var expiresValue = new Date(today);
    expiresValue.setHours(today.getHours() + 24*7); 
    this.cookieService.set("MoneroAUXUsersecureLocalTokenAuth",token,expiresValue);
    let cachetoken = this.cookieService.get("MoneroAUXUsersecureLocalTokenAuth");
    let storeStr = (CryptoJS.AES.encrypt(email,cachetoken)).toString();
    this.cookieService.set("MoneroAUXUserCacheEmail",storeStr,expiresValue);
    let gets = this.cookieService.get("MoneroAUXUserCacheEmail");
    //console.log("stored",this.retrieveFromLocal(gets),"\nits validity")
  }

  retrieveCacheEmail(){
    let token = this.cookieService.get("MoneroAUXUsersecureLocalTokenAuth");
    let fromStorage = this.cookieService.get("MoneroAUXUserCacheEmail");
    //console.log(fromStorage)
    if(fromStorage == "" || fromStorage == null){
      return "";
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = "";
      finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }

  clearUserSession(){
    // clearInterval(this.interval);
    //setTimeout(()=>{
      this.cookieService.delete('AUXUserCookieServe');
      this.sessionStorage.clear();
    //},1000);
  }

  clearIntervalInLogin(){
    clearInterval(this.interval);
  }

  checkInfinityUserActivity(){
    let chk = setInterval(()=>{
      const cookieExists: boolean = this.cookieService.check('AUXUserCookieServe');
      if(cookieExists){
        //console.log(cookieExists)
        return true;
      }else{
        //console.log(cookieExists)
        clearInterval(chk);
        return false;
      }
    },2500);
  }

  checkUserActivity(){
    const cookieExists: boolean = this.cookieService.check('AUXUserCookieServe');
    if(cookieExists){
      let token = this.sessionStorage.retrieve("MoneroAUXUserSessionToken");
      let cookie = this.cookieService.get('AUXUserCookieServe');
      // if(token == cookie){
      //   //console.log("true1")
      //   return true;
      // }
      // else {
      //  // console.log("false1")
      //   return false;
      // }
      return true;
    }else{
      //console.log("false2")
      return false;
    }
  }

  checkActivity(){
    //const cookieExists: boolean = this.cookieService.check('AUXUserCookieServe');
    this.interval = setInterval(()=>{
      let cookieExists = this.cookieService.check('AUXUserCookieServe');
      if(cookieExists){
        let token = this.sessionStorage.retrieve("MoneroAUXUserSessionToken");
        let cookie = this.cookieService.get('AUXUserCookieServe');
        // if(token == cookie){
        //   //console.log("true1")
        //   return true;
        // }
        // else {
        //  // console.log("false1")
        //   return false;
        // }
        // console.log("true1",cookieExists,cookie)
      }else{
        clearInterval(this.interval);
        // console.log("false2")
        let url = this.storage.retrieve("MoneroAUXUserUrl");
        this.storage.clear();
        localStorage.clear();
        this.fbapi.logout();
        this.storage.store("MoneroAUXUserUrl",url);
        this.router.navigate(["/login"]);
        // this.router.navigate(["/login","session_timedout"]);
        location.reload();
        this.clearUserSession();
        // console.log("false2",cookieExists) 
      }  
    },1000);
    
  }

  calcsubstr(amnt){
    let retrieve = 0;
    // console.log("**********************************\n","base",amnt);
    if(amnt == 0){
        retrieve = 0;
    }else{
        var l2 = amnt - Math.floor(amnt);
        // console.log("florr",l2)
        
        var l = Math.floor(amnt);
        // console.log("flrr<-",l);
        
        var l1 = l2.toString().substr(0,8);
        // console.log("substr->",l1)
        
        var l4 = parseFloat(l1);

        //let l33:number = l4;
        var l3 = l + l4 ;
        // console.log("retr",l3)
        
        retrieve = l3;
    }
    return retrieve;
  }
}
