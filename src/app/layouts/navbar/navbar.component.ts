import { Component, OnInit, TemplateRef } from '@angular/core';
import { ViewChild,ElementRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from 'ngx-toastr';
 import { SignupService } from '../../services/signup.service';
 import { Router, ActivatedRoute, ParamMap } from '@angular/router';
 import 'rxjs/add/operator/switchMap'; //to fetch url params

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers:[SignupService]
})
export class NavbarComponent implements OnInit {

  modalRef: BsModalRef;

  @ViewChild('mySidenav') public mySidenav:ElementRef;
  @ViewChild('sidenav') public sidenav:ElementRef;

  public shown:boolean;
  public i:number = 0;

  year:any;

  username:any;

  constructor(
    public element:ElementRef,
    private toastr: ToastrService,
    public signup:SignupService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.shown = false;
    this.year = new Date().getFullYear();
  }

  ngOnInit() {
    //this.sidenav.nativeElement.style.display = "none";

    // this.username = this.signup.retrieveUsername("MoneroAUXMassUserName");
    let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
    let splitname = name.split(" ");
    // console.log(splitname)
    this.username = splitname[0];


    // let status = this.signup.retrieveFromLocal("MoneroAUXKYCStatus"); 
    // console.log(status);
  }

  ngDoCheck(){
    let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
    let splitname = name.split(" ");
    // console.log(splitname)
    this.username = splitname[0];
  }

  showcollapse(){
    if(this.i%2==0){
      //console.log("show");
      this.shown = true;
    }else{
      //console.log("hide");
      this.shown = false;
    }
    this.i++;
  }

  openNav(){
    let width = this.mySidenav.nativeElement.style.width;
    if(width == "250px"){
      this.mySidenav.nativeElement.style.width = "0";
    }else{
      this.mySidenav.nativeElement.style.width = "250px";
    }
  }

  clickonReferral(){
    // let status = this.signup.retrieveFromLocal("MoneroAUXUserAddReferralStatus");//,"none" // "done"
    // console.log(status)
    // if(status == "done"){
    //   this.router.navigate(["/referral"]);
    // }else{
    //   this.router.navigate(["/addreferral"]);
    // }// [routerLink]="['/referral']"
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

  closeNav(){
    this.mySidenav.nativeElement.style.width = "0";
  }

  doLogout(template: TemplateRef<any>){
    this.mySidenav.nativeElement.style.width = "0";
    //console.log("im clicked");
    this.modalRef = this.modalService.show(template,{class: 'modal-sm'});
  }

  confirm(): void {
    this.signup.logoutFromApp();
    this.modalRef.hide();
  }
 
  decline(): void {
    let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
    // this.toastr.info("Dear "+name+"! , you are continuing XMRC Cryp ICO","Continued...",{timeOut:2500});
    this.modalRef.hide();
  }

  homeReload(){
    this.router.navigateByUrl("home");
  }

  checkKYC(){
    this.mySidenav.nativeElement.style.width = "0";
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
// mobile view