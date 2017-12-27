import { Component, OnInit, TemplateRef } from '@angular/core';

import { ServiceapiService } from '../../services/serviceapi.service';
import { SignupService } from '../../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
@Component({
  selector: 'app-sidebarnew',
  templateUrl: './sidebarnew.component.html',
  styleUrls: ['./sidebarnew.component.css'],
  providers:[SignupService,ServiceapiService]
})
export class SidebarnewComponent implements OnInit {

  mycurrentpage:string;
  
    modalRef: BsModalRef;
    
    isClassActive:string;
  
    routeHomeActive:string = "";
    routeReferralActive:string = "";
    routeKycActive:string = "";
    routeAddreferralActive:string = "";
    routeSettingActive:string = "";
    routeSettingin:string = "";
    routeHelpDesk:string = "";
  
    username:any;
    constructor(
      public serv:ServiceapiService,
      private storage:LocalStorageService,
      private toastr: ToastrService,
      public signup:SignupService,
      private route: ActivatedRoute,
      private router: Router,
      private modalService: BsModalService
    ) { 
      //console.log(this.route);
      let path = this.route.routeConfig.path;
      //console.log(path)
      if(path == "home" || path == "transactions"){
        this.isClassActive = "active";
      }else{
        this.isClassActive = "";
      }
    }
  
    ngOnInit() {
      
    }

  
    ngDoCheck(){
      this.checklistactive();
      let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
      let splitname = name.split(" ");
      // console.log(splitname)
      this.username = splitname[0];
    }
  
    checklistactive(){
      let urls = this.router.url;
      switch (urls) {
        case "/home":
            this.routeHomeActive = "active"; 
            this.routeReferralActive = "";
            this.routeKycActive= "";
            this.routeAddreferralActive= "";
            this.routeSettingActive= "";
            this.routeSettingin= "";
            this.routeHelpDesk = "";
          break;
        case "/referral":
        case "/referral/address":
          this.routeHomeActive = "";
          this.routeReferralActive = "active";
          this.routeKycActive= "";
          this.routeAddreferralActive= "";
          this.routeSettingActive= "";
          this.routeSettingin= "";
          this.routeHelpDesk = "";
          break;
        case "/addreferral":
            this.routeHomeActive = "";
            this.routeReferralActive = "";
            this.routeKycActive= "";
            this.routeAddreferralActive= "active";
            this.routeSettingActive= "settingactive";
            this.routeSettingin= "in";
            this.routeHelpDesk = "";
            break;
        case "/updatekyc":
            this.routeHomeActive = "";
            this.routeReferralActive = "";
            this.routeKycActive= "active";
            this.routeAddreferralActive= "";
            this.routeSettingActive= "settingactive";
            this.routeSettingin= "in";
            this.routeHelpDesk = "";
            break;
        case "/helpdesk":
            this.routeHomeActive = "";
            this.routeReferralActive = "";
            this.routeKycActive= "";
            this.routeAddreferralActive= "";
            this.routeSettingActive= "";
            this.routeSettingin= "";
            this.routeHelpDesk = "active";
            break;
        default:
          this.routeHomeActive = "";
          this.routeReferralActive = "";
          this.routeKycActive= "";
          this.routeAddreferralActive= "";
          this.routeSettingActive= "";
          this.routeSettingin= "";
          this.routeHelpDesk = "";
          break;
      }
    }
  
    clickonReferral(){
      // console.log("sdf")
      // let status = this.signup.retrieveFromLocal("MoneroAUXUserAddReferralStatus");//,"none" // "done"
      // if(status == "done" || status){
      //   this.router.navigate(["/referral"]);
      // }else{
      //   this.router.navigate(["/addreferral"]);
      // }
      let e = this.signup.retrieveRefundAddress("MoneroAUXUserRefundEtherAddress");
      let b = this.signup.retrieveRefundAddress("MoneroAUXUserRefundBitcoinAddress");
      if(e == "" || e == null || !e){
        this.router.navigate(["/addreferral"]);
        // this.toastr.info("Dear "+name+"! , you need to update refund address by clicking on addreferral button",null,{timeOut:2500});    
      }else if(b == "" || b == null || !b){
        this.router.navigate(["/addreferral"]);
        // this.toastr.info("Dear "+name+"! , you need to update refund address by clicking on addreferral button",null,{timeOut:2500});    
      }else{
        this.router.navigate(["/referral"]);
      }
    }
  
    doLogout(template: TemplateRef<any>){
      //console.log("im clicked");
      this.modalRef = this.modalService.show(template,{class: 'modal-sm'});
    }
  
    confirm(): void {
      this.signup.logoutFromApp();
      this.modalRef.hide();
    }
  
    homeReload(){
      this.router.navigateByUrl("home");
    }
  
    helpdesk(){
      this.router.navigateByUrl("helpdesk");
    }
   
    decline(): void {
      let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
      // this.toastr.info("Dear "+name+"! , you are continuing XMRC Cryp ICO","Continued...",{timeOut:2500});
      this.modalRef.hide();
    }
  
    checkKYC(){
      let status = this.signup.retrieveFromLocal("MoneroAUXKYCStatus"); 
      if(status == "nokyc"){
        this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }
      // else if(status == "done"){
      //   this.toastr.success("Your KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
      //   this.router.navigate(["/updatekyc"]);
      // }
      else if(status == "pending"){
        this.toastr.warning("KYC is waiting for administrator approval. You can continue buying XMRC Coins.",null,{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }else if(status == "rejected"){
        this.toastr.error("Your KYC detail has been rejected","KYC rejected",{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }else if(status == false){
        this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }
      // else if(status == true){
      //   this.toastr.success("Your KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
      // }
      else if(status == "accepted"){
        this.toastr.success("Your KYC detail is verified by administrator","KYC is verified",{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }else{
        // this.toastr.error("You have not uploaded the KYC documents","Upload KYC",{timeOut:2500});
        this.router.navigate(["/updatekyc"]);
      }
    }

}
