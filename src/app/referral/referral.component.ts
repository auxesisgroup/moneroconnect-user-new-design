import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Router, ActivatedRoute, ParamMap,NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import * as _ from 'lodash';

import { PouchService } from '../services/pouch.service';

import * as urlencode from 'urlencode';
// import { CeiboShare } from 'ng2-social-share';
window;
@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css'],
  providers:[ServiceapiService,SignupService,PouchService]
})
export class ReferralComponent implements OnInit {

  referraladdressvalue:string;
  referridvalue:string = "XXXXXXX";

  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };
  
  config2 = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  loadingimage:boolean = false;

  btcwithdrawntab:number = 1;
  ethwithdrawntab:number = 1;

  sendUrl = location.href;

  //populateScope
  cardbtcearned:any;cardbtcwithdrawn:any;cardbtcpending:any;
  cardethearned:any;cardethwithdrawn:any;cardethpending:any;

  referral_details_list:any;referral_details_list_alert:boolean = false;
  child_details:any;child_details_alert:boolean = false;

  modalbtcpending_amount:any;modalbtcwithdraw_address:any;modalbtcamount_to_be_paid:any;modalbtcfee:any;
  modalethpending_amount:any;modalethwithdraw_address:any;modalethamount_to_be_paid:any;modalethfee:any;

  otpBTC:any;otpETH:any;

  btcbtnDisabled:boolean = true;
  ethbtnDisabled:boolean = true;

  @ViewChild('panelScroll') private panelScroll:ElementRef;

  @ViewChild('successmodal') successmodal:ElementRef;
  successCurrency:any;
  successMessage:any;
  successcap:any;

  bitcoinurl:any = "https://blockchain.info/tx";
  etherurl:any = "https://etherscan.io/tx";
  public ngxloading  = false; 

  constructor(
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    public signup:SignupService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    public pouchserv:PouchService
  ) { }

  ngOnInit() { 
    
    this.ngxloading = true; 

    let loadurl = this.router.url;
    if(loadurl == "/referral"){
      this.loadReferralAuth();
      // console.log("its current url");
    }else if(loadurl == "/referral/address"){
      this.ngxloading = false; 
      this.router.navigate(["/referral"]);
    }else{//if url in /referral/address/refid
      this.ngxloading = false; 
      let referenceid = this.route.snapshot.paramMap.get("refid");
      // console.log("its ref url",referenceid,"\nredirect and save");
      this.signup.saveReferralId("MoneroAUXUserReferralID",referenceid);
      // this.router.navigateByUrl("/login");
      location.href = "http://moneroconnect.io";
    }
    // console.log(this.router.url,this.sendUrl)

    // this.openSuccessModal('eth','#txid');
    // this.router.events.subscribe((evt) => {
    //     if (!(evt instanceof NavigationEnd)) {
    //         return;
    //     }
    //     document.body.scrollTop = 0;
    // });
    this.signup.checkActivity();

    // this.successMessage = "Please wait while we confirm your transaction in 24 - 48 hours. We have also sent you a mail at registered ID regarding this request and will confirm over mail with transaction ID as withdrawal is completed.";
    // this.modalRef = this.modalService.show(
    //   this.successmodal,
    //     Object.assign({}, this.config2, { class: 'gray modal-md' })
    // );
  } 


  loadReferralAuth(){
    let isAuth = this.storage.retrieve("MoneroAUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
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
      // console.log("isAuthorized",isAuth,cookieExists);
      this.checkReferral();
      // this.callApi();//call in referral
      this.referraladdressvalue = this.sendUrl+"/address/";
    }
  }

  checkReferral(){
    let retrieve = this.signup.retrieveRouteMsgPass();
    let etheraddress = this.signup.retrieveRefundAddress("MoneroAUXUserRefundEtherAddress");
    let bitcoinaddress = this.signup.retrieveRefundAddress("MoneroAUXUserRefundBitcoinAddress");
    let msg;
    if(retrieve != null && etheraddress != null && bitcoinaddress != null){
      msg = retrieve;
      setTimeout(()=>{this.toastr.success(msg, 'Done!',{timeOut:1200});},1200);
      setTimeout(()=>{
        msg = "";
        this.signup.removeRouteMsgPass();
      },2000);
    }

    // if(etheraddress == "" || etheraddress == null || !etheraddress){
    //   // console.log("Redirect to addreferral");
    //   this.signup.setRouteMsgPass("BTH & ETH address is not taken try to add");
    //   this.router.navigate(["/addreferral"]);
    // }else if(bitcoinaddress == "" || bitcoinaddress == null || !bitcoinaddress){
    //   // console.log("Redirect to addreferral");
    //   this.signup.setRouteMsgPass("BTH & ETH address is not taken try to add");
    //   this.router.navigate(["/addreferral"]);
    // }else{
      // console.log("proceed to callapi()");
      this.callApi();
    // }
  }

  toscroll(){
    window.scrollTo(0,document.body.scrollHeight);
    this.scrollToBottom(); 
  }

  copytext(referraladdress){
    this.toastr.info(null,'Referral address copied to your clipboard!',{timeOut:1500});
  }

  copytext2(referrid){
    this.toastr.info(null, 'Referral Id copied to your clipboard.',{timeOut:1500});
  }

  open_btc_modal(btcmodal: TemplateRef<any>){
    this.callToOpenModal('btc',btcmodal);
  }

  open_eth_modal(ethmodal: TemplateRef<any>){
    this.callToOpenModal('eth',ethmodal);
  }

  callToOpenModal(type,modal){
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
      'currency':type
    };
    // console.info(d);
    this.serv.resolveApi("init_withdraw",d)
    .subscribe(
      res=>{
        let response = JSON.parse(JSON.stringify(res));
        // console.log()
        if(response != null || response != ""){
          // console.log(response);
          if(response.code == 200){
            let data = response.data;
            if(type == 'btc'){
              // console.log("im btc")
              let pa = data.pending_amount;
              let atb = data.amount_to_be_paid;
              this.modalbtcpending_amount = this.signup.calcsubstr(pa);
              this.modalbtcwithdraw_address = data.withdraw_address;
              this.modalbtcamount_to_be_paid = this.signup.calcsubstr(atb);
              this.modalbtcfee = data.fee;
            }
            if(type == 'eth'){
              // console.log("im eth")
              let pa = data.pending_amount;
              let atb = data.amount_to_be_paid;
              this.modalethpending_amount = this.signup.calcsubstr(pa);
              this.modalethwithdraw_address = data.withdraw_address;
              this.modalethamount_to_be_paid = this.signup.calcsubstr(atb);
              this.modalethfee = data.fee;
            }
            this.modalRef = this.modalService.show(
              modal,
                Object.assign({}, this.config, { class: 'gray modal-md' })
            );
          }else if(response.code == 400){
            this.toastr.error('Unable to calculate mining fee for '+type, 'Mining Fee Error',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // logout
            this.signup.UnAuthlogoutFromApp();
          }
        }else{
          // console.log(response);
          this.toastr.error('Withdrawn detail not available', 'Not a valid response',{timeOut:2500});
        }
      },
      err=>{
          // console.error(err);
          this.toastr.error('Withdrawn detail not retrieved', 'Not a valid response',{timeOut:2500});
      }
    );
  }

  callApi(){
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
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
              this.signup.saveToLocal("MoneroAUXUserAddReferralStatus","none");
              this.router.navigate(["/addreferral"]);
            }else{ 
              this.signup.saveToLocal("MoneroAUXUserAddReferralStatus","done");
              this.signup.saveRefundAddress("MoneroAUXUserRefundEtherAddress",ethrefund);
              this.signup.saveRefundAddress("MoneroAUXUserRefundBitcoinAddress",btcrefund);
              this.referridvalue = response.referral_json.ref_id;
              this.referraladdressvalue = this.sendUrl+"/address/"+this.referridvalue;

              this.cardbtcearned = this.signup.calcsubstr(response.referral_json.earned_btc);
              this.cardbtcwithdrawn = this.signup.calcsubstr(response.referral_json.withdrawn_btc);
              this.cardbtcpending = this.signup.calcsubstr(response.referral_json.pending_btc);

              this.cardethearned = this.signup.calcsubstr(response.referral_json.earned_eth);
              this.cardethwithdrawn = this.signup.calcsubstr(response.referral_json.withdrawn_eth);
              this.cardethpending = this.signup.calcsubstr(response.referral_json.pending_eth);

              // check pending amount to open modal 
              if(this.cardbtcpending >= 0.002){ // 1000
                // console.log("btc greater")
                this.btcbtnDisabled = false;
              }else{
                // console.log("btc lesser")
                this.btcbtnDisabled = true;
              }
              if(this.cardethpending >= 0.01){ // 10000
                // console.log("eth greater")
                this.ethbtnDisabled = false;
              }else{
                // console.log("eth lesser")
                this.ethbtnDisabled = true;
              }

              let referral_details_list = response.referral_json.referral_details_list;
              if(referral_details_list.length > 0){
                this.referral_details_list_alert = true;//populate it
                this.populateReferralList(referral_details_list);
              }else{
                this.referral_details_list_alert = false;
              }

              let child_details = response.referral_json.child_details;
              if(child_details.length > 0){
                this.child_details_alert = true;//populate it
                this.populateChildList(child_details);
              }else{
                this.child_details_alert = false;
              }
            }

          }else if(response.code == 400){
            this.signup.saveToLocal("MoneroAUXUserAddReferralStatus","none");
            // this.signup.setRouteMsgPass("BTH & ETH refund address is not taken try to add first");
            this.router.navigate(["/addreferral"]);
          }else if(response.code == 401){
            this.signup.saveToLocal("MoneroAUXUserAddReferralStatus","none");
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.signup.saveToLocal("MoneroAUXUserAddReferralStatus","none");
            // this.signup.setRouteMsgPass("BTH & ETH refund address is not taken try to add first");
            this.router.navigate(["/addreferral"]);
          }
        }else{
          // console.log(response);
          this.toastr.error('Referral detail not retrieved', 'Not a valid response',{timeOut:2500});
          history.back();
        }
      },
      err=>{
          this.ngxloading = false; 
          // console.error(err);
          this.putErrorInPouch("callApi()","Response error in component "+this.constructor.name,"'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
          this.toastr.error('Referral detail not retrieved', 'Not a valid response',{timeOut:2500});
          history.back();
      }
    );
  }

  populateReferralList(referral_details_list){
    // console.log(referral_details_list.length,referral_details_list);
    let arr = [];
    referral_details_list.forEach((value,key) => {
      let b1 = this.signup.calcsubstr(value.amount_in_btc);
      let b2 = this.signup.calcsubstr(value.amount_in_eth);
      arr.push({
        srno:(key+1),
        name:value.name,
        degree:value.degree,
        amount_in_btc:b1,
        amount_in_eth:b2
      }); 
    });
    this.referral_details_list = arr;
  }
  populateChildList(child_details){
    // console.log(JSON.stringify(child_details));
    // child_details = [
    //   {
    //     "1": [
    //       "Akash Spot",
    //       "Pijush Sarkar",
    //       "Akash Ecell",
    //       "Harsh Spot",
    //       "Akash Gmail",
    //       "Akash Gaurav",
    //       "Anjali"
    //     ]
    //   },
    //   {
    //     "2": [
    //       "Kamendra singh ",
    //       "Aman",
    //       "Sunny Kumar",
    //       "Hitesh Sapre",
    //       "Ashishkumar",
    //       "neelam",
    //       "Chandrajeet kumar",
    //       "Sanjeev tripathi",
    //       "Ravi Bhardwaj",
    //       "Ruchi Sarkar",
    //       "abu baker ",
    //       "Anurag Khandelwal",
    //       "Akash Gaurav",
    //       "Dharmendra kumar ",
    //       "Neelam",
    //       "Shivcharan Rohilla"
    //     ]
    //   }
    // ];
    // child_details = [
    //   {
    //     "1": [
    //       [
    //         "abcd tester","Hola tester","khskfhls","asdfsdfd","asdfsdf","asdfsdf"
    //       ]
    //     ]
    //   },
    //   {
    //     "2":[
    //       [
    //         "userr2","user221"  
    //       ]  
    //     ]
    //   }
    // ]
    // console.log(JSON.stringify(child_details));
    let arr = [];
    child_details.forEach((value,key) => {
      let degreearr = Object.keys(value);
      let nameobj = Object.values(value);
      let names = "";
      // console.log(value,key,Object.values(nameobj),degreearr);// value,key,nameobj.values,
      nameobj.forEach((v,k)=>{
        // console.log(v,k)
        let nameobj2 = Object.values(v);
        // console.log(nameobj2)
        nameobj2.forEach((v2,k2)=>{
          // console.log(v2,k2)
          names += ""+v2 + " , ";
          // let nameobj3 = Object.values(v);       
          // nameobj3.forEach((v3,k3)=>{
          //   // console.log(v3,k3)
          //   names += ""+v3 + " , ";
          // });
        });
      })
      names = names.replace(/,\s*$/, "");
      arr.push({
        srno:(key+1),
        name:names,
        degree:degreearr[0],
        namearr:value,
        degreearr:value
      })
    });
    // console.log(arr);
    this.child_details = arr;
  }

  hideme(){
    this.modalRef.hide();
  }

  sendBTC(){
    this.sendingToWithdrawOTP('btc');
  }


  sendingToWithdrawOTP(type){
    this.loadingimage = true;
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("send_withdraw_otp",d)
    .subscribe(
      res=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        if(response != null || response != ""){
          // console.log(response);
          if(response.code == 200){
            if(type == 'btc'){
              this.btcwithdrawntab = 2;
            }else if(type == 'eth'){
              this.ethwithdrawntab = 2;
            }
            this.toastr.success('OTP sent at your mail ID', null,{timeOut:2500});
          }else if(response.code == 400){
            this.toastr.error('Unable to send mail', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.toastr.error('Unable to send mail', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // console.log(response);
          this.toastr.error('Unable to send mail', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
          this.loadingimage = false;
          // console.error(err);
          this.toastr.error('Unable to send mail', 'Abandoned!',{timeOut:2500});
          this.putErrorInPouch("sendingToWithdrawOTP()","Response error in component "+this.constructor.name,"'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );
  } 

  confirmWithdrawOTP(type){
    let otp;
    if(type == 'btc') otp = this.otpBTC;
    if(type == 'eth') otp = this.otpETH;
    if(otp == null || otp == ""){
      this.toastr.error('Field otp is required to proceed further', 'OTP required',{timeOut:2500});     
    }else{
      this.loadingimage = true;
      let d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'otp':otp,
        'currency':type
      };
      // console.info(d);
      this.serv.resolveApi("confirm_withdraw",d)
      .subscribe(
        res=>{
          this.loadingimage = false;
          let response = JSON.parse(JSON.stringify(res));
          // this.modalRef.hide();
          //     let cap;
          //     if(type == 'btc') {
          //       this.otpBTC = "";cap = "BTC";this.btcwithdrawntab = 1;
          //     }
          //     if(type == 'eth') {
          //       this.otpETH = "";cap = "ETH";this.ethwithdrawntab = 1;
          //     }
          //     // let txid = response.txid?response.txid:'none';
          //     this.openSuccessModal(cap);

          if(response == null || response == ""){
            // console.log(response);
            this.toastr.error('Unable to verify OTP.', 'Abandoned!',{timeOut:2500});
          }else{
            // console.log(response);
            if(response.code == 200){
              this.modalRef.hide();
              let cap;
              if(type == 'btc') {
                this.otpBTC = "";cap = "BTC";this.btcwithdrawntab = 1;
              }
              if(type == 'eth') {
                this.otpETH = "";cap = "ETH";this.ethwithdrawntab = 1;
              }
              // let txid = response.txid?response.txid:'none';
              this.openSuccessModal(cap);
              
            }else if(response.code == 400){
              //
              let msg = response.error;//"transaction_failed"
              if(msg == "otp_mismatch"){
                this.toastr.error('OTP is wrong, try again', 'Abandoned!',{timeOut:2500});
              }else{//"transaction_failed"
                this.modalRef.hide();
                this.toastr.error('Transaction failed, try again', 'Abandoned!',{timeOut:2500});
              }
            }else if(response.code == 401){
              this.signup.UnAuthlogoutFromApp();
            }else{
              this.toastr.error('Unable to verify OTP.', 'Abandoned!',{timeOut:2500});
            }
          }
        },
        err=>{
          this.loadingimage = false;
            // console.error(err);
            // this.modalRef.hide();
            // let cap;
            // if(type == 'btc') {
            //   this.otpBTC = "";cap = "BTC";this.btcwithdrawntab = 1;
            // }
            // if(type == 'eth') {
            //   this.otpETH = "";cap = "ETH";this.ethwithdrawntab = 1;
            // }
            // // let txid = response.txid?response.txid:'none';
            // this.openSuccessModal(cap);
            this.toastr.error('Unable to verify OTP.', 'Abandoned!',{timeOut:2500});
            this.putErrorInPouch("confirmWithdrawOTP()","Response error in component "+this.constructor.name,"'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
            
        }
      );
    }
  }

  confirmBTC(){
    this.confirmWithdrawOTP('btc');
  }

  sendETH(){
    this.sendingToWithdrawOTP('eth');
  }

  confirmETH(){
    this.confirmWithdrawOTP('eth');
  }

  openSuccessModal(cap){
    this.successcap = cap;
    this.successCurrency = cap;
    this.successMessage = "Please wait while we confirm your transaction in 24 - 48 hours. We have also sent you a mail at registered ID regarding this request and will confirm over mail with transaction ID as withdrawal is completed.";
    this.modalRef = this.modalService.show(
      this.successmodal,
        Object.assign({}, this.config2, { class: 'gray modal-md' })
    );
    // this.toastr.success('OTP verified and your '+cap+' transaction is completed.', 'Done!',{timeOut:2500});
  }
  donefinally(){
    this.successcap = '';
    this.successCurrency = '';
    this.successMessage = '';
    this.modalRef.hide();
    location.reload();
  }

  scrollToBottom(): void {
      try {
          this.panelScroll.nativeElement.scrollTop = this.panelScroll.nativeElement.scrollHeight;
      } catch(err) { }                 
  }

  putErrorInPouch(fun,desc,notes,priority){
    let id = this.serv.retrieveFromLocal("MoneroAUXUserEmail");
    let page = this.router.url;
    let func = fun;
    let description = desc;
    // console.log(id,page,func,description)
    this.pouchserv.letsIssuing(id,page,func,description,notes,priority);
  }

  socialshare(type){
    let url = urlencode(this.referraladdressvalue);
    // console.log(type,url)
    if(type=="fb"){
      var myWindow = window.open("https://www.facebook.com/sharer.php?u="+url, "Facebook Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
      // var myWindow = window.open("https://web.skype.com/share?url=?u="+url, "Skype Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
      // var myWindow = window.open("whatsapp://send?text="+url, "Whatsapp Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
    }else if(type=="tw"){
      var myWindow = window.open("https://twitter.com/intent/tweet?url="+url+"&text=Referral Share&via=Moneroconnect&hashtags='Moneroconnect,XMRC,ICO'", "Twitter Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
    }else if(type=="ln"){
      var myWindow = window.open("https://www.linkedin.com/shareArticle?url="+url+"&title=Referral Share", "Linkedin Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
    }else if(type=="tl"){
      var myWindow = window.open("https://telegram.me/share/url?url="+url+"&text=Referral Share", "Telegram Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
    }else if(type=="gl"){
      var myWindow = window.open("https://plus.google.com/share?url="+url, "Google Share", "width=600,height=500,fullscreen=no,top=100,left=400,resizable=no");
    }
  }
}

 