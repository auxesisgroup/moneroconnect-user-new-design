import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';
@Component({
  selector: 'app-addreferral',
  templateUrl: './addreferral.component.html',
  styleUrls: ['./addreferral.component.css']
})
export class AddreferralComponent implements OnInit {

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  loadingimage:boolean = false;

  formReferral:FormGroup;

  bitcoinaddress:any;
  etheraddress:any;

  referralbtnTxt:string = "Next";
  public ngxloading  = false;
  constructor(
    public serv:ServiceapiService,
    public signup:SignupService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    private formBuilder:FormBuilder

  ) {
    this.formReferral = formBuilder.group({
      'bitcoin':['',Validators.compose([Validators.required])],
      'ether':['',Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.loadAddReferralAuth();
  }

  loadAddReferralAuth(){
    let isAuth = this.storage.retrieve("AUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    if(isAuth == null){
      this.signup.UnAuthlogoutFromApp(); 
    }
    else if(cookieExists == false){
      this.storage.store("AUXAuthLogin",false);
      this.signup.UnAuthlogoutFromApp();
    }
    else{
      // console.log("isAuthorized",isAuth,cookieExists);
      this.loadifReferral();
    }
  }

  loadifReferral(){
    let retrieve = this.signup.retrieveRouteMsgPass();
    let msg;
    if(retrieve != null){
      msg = retrieve;
      this.printmsg(msg);
      setTimeout(()=>{
        msg = "";
        this.signup.removeRouteMsgPass();
      },2000);
    }

    let etheraddress = this.signup.retrieveRefundAddressFromLocal("AUXUserRefundEtherAddress");
    let bitcoinaddress = this.signup.retrieveRefundAddressFromLocal("AUXUserRefundBitcoinAddress");
    if(etheraddress == "" || etheraddress == null || !etheraddress){
      this.loadFromCookie();
      // console.log("do not touch form inputs",etheraddress,this.signup.retrieveRefundAddress("AUXUserRefundEtherAddress"));
    }else if(bitcoinaddress == "" || bitcoinaddress == null || !bitcoinaddress){
      this.loadFromCookie();
      // console.log("do not touch form inputs",bitcoinaddress,this.signup.retrieveRefundAddress("AUXUserRefundBitcoinAddress")); 
    }else{ 
      this.referralbtnTxt = "Update";
      this.bitcoinaddress = bitcoinaddress;// console.log("append to btcaddress");
      this.etheraddress = etheraddress;// console.log("append to etheraddress");
    }
  }

  loadFromCookie(){
    let e = this.signup.retrieveRefundAddress("AUXUserRefundEtherAddress");
    let b = this.signup.retrieveRefundAddress("AUXUserRefundBitcoinAddress");
    if(e == "" || e == null || !e){
      // console.log("cookie",e)
      this.loadFromWeb();
    }else if(b == "" || b == null || !b){
      // console.log("cookie",b)
      this.loadFromWeb();
    }else{
      // console.log("cookie",e,b)
      this.referralbtnTxt = "Update";
      this.bitcoinaddress = b;// console.log("append to btcaddress");
      this.etheraddress = e;// console.log("append to etheraddress");
    }
  }

  loadFromWeb(){
    this.ngxloading = true; 
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("get_referral_details",d)
    .subscribe(
      res=>{
        this.ngxloading = false; 
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          // console.log(response);
          if(response.code == 200){
            let btcrefund = response.referral_json.btc_refund_address;
            let ethrefund = response.referral_json.eth_refund_address;
            if(btcrefund == null || btcrefund == "" || ethrefund == null || ethrefund == ""){
              // this.signup.setRouteMsgPass("BTC & ETH refund address is not taken try to add first");
              this.signup.saveToLocal("AUXUserAddReferralStatus","none");
              // this.router.navigate(["/addreferral"]);
            }else{ 
              this.signup.saveToLocal("AUXUserAddReferralStatus","done");
              this.signup.saveRefundAddress("AUXUserRefundEtherAddress",ethrefund);
              this.signup.saveRefundAddress("AUXUserRefundBitcoinAddress",btcrefund);
              this.referralbtnTxt = "Update";
              this.bitcoinaddress = btcrefund;// console.log("append to address");
              this.etheraddress =ethrefund;
              this.router.navigate(["/referral"]);
            }
            if(btcrefund != null || btcrefund != ""){
              this.bitcoinaddress = btcrefund;// console.log("append to address");
            }
            if(ethrefund != null || ethrefund != ""){
              this.etheraddress = ethrefund;// console.log("append to address");
            }
          }else if(response.code == 400){
            // this.signup.saveToLocal("AUXUserAddReferralStatus","none");
            // this.signup.setRouteMsgPass("BTH & ETH refund address is not taken try to add first");
            // this.router.navigate(["/addreferral"]);
          }else if(response.code == 401){
            this.signup.saveToLocal("AUXUserAddReferralStatus","none");
            this.signup.UnAuthlogoutFromApp();
          }else{
            
          }
        }else{
          // console.log(response);
        }
      },
      err=>{
          this.ngxloading = true; 
          // console.error(err);
      }
    );
  }
  
  printmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2500);
  }

  addreferral(){
    // console.log(this.formReferral)
    if(this.formReferral.valid){
      let btc = this.formReferral.value.bitcoin;
      let eth = this.formReferral.value.ether;
      if(btc == null || btc == ""){
        this.printmsg("Bitcoin address are invalid, try again.");
      }else if(eth == null || eth == ""){
        this.printmsg("Ether address are invalid, try again.");
      }else{
        // console.log(this.formReferral);
        this.sendToReferral(btc,eth);
      }
    }else{
      this.printmsg("Addresses are invalid, try again.");
    }
  }

  sendToReferral(btc,eth){
    this.loadingimage = true;
    let d = {
      'email':this.signup.retrieveFromLocal("AUXUserEmail"),
      'token':this.signup.retrieveFromLocal("AUXHomeUserToken"),
      'refund_btc_address':btc,
      'refund_eth_address':eth
    };
    // console.info(d);
    this.serv.resolveApi("set_btc_eth_refund_address",d)
    .subscribe(
      res=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          // console.log(response);
          if(response.code == 200){
            //n3qoMXxdmuwFxSZkFhvXqXiDRzsfy7MqCm tx4343654645754767
            this.signup.setRouteMsgPass("BTC & ETH addresses are stored");
            this.signup.saveRefundAddress("AUXUserRefundEtherAddress",eth);
            this.signup.saveRefundAddress("AUXUserRefundBitcoinAddress",btc);
            this.router.navigate(["/referral"]);
          }else if(response.code == 400){
            if(response.eth_address_validation == false){
              this.printmsg("Ether address is invalid");
            }else if(response.btc_address_validation == false){
              this.printmsg("Bitcoin address is invalid");
            }else{
              this.printmsg("Addresses are invalid");
            }
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // logout
            this.signup.UnAuthlogoutFromApp();
          }
        }else{
          // console.log(response);
          this.printmsg("Addressess are unable to processed try again");
        }
      },
      err=>{
          this.loadingimage = false;
          // console.error(err);
          this.printmsg("Addresses are failed to submit");
      }
    );
  }

  notnow(){
    if(this.referralbtnTxt == "Update"){
      this.router.navigate(["/referral"]);
    }else{
      this.router.navigate(["/home"]);
    }
  }

  gohome(){
    // this.ifValue();
    this.router.navigate(["/home"]);
  }

  ifValue(){
    let e = this.signup.retrieveRefundAddress("AUXUserRefundEtherAddress");
    let b = this.signup.retrieveRefundAddress("AUXUserRefundBitcoinAddress");
    if(e == "" || e == null || !e){
      // console.log("donothing",e)
    }else if(b == "" || b == null || !b){
      // console.log("donothing",b)
      this.loadFromWeb();
    }else{
      this.signup.saveToLocal("AUXUserAddReferralStatus","done");
      this.signup.saveRefundAddress("AUXUserRefundEtherAddress",e);
      this.signup.saveRefundAddress("AUXUserRefundBitcoinAddress",b);
    }
  }
}
