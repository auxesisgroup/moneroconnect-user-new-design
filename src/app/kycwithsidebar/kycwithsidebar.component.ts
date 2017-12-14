import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import { SignupService } from '../services/signup.service';
import { ServiceapiService } from '../services/serviceapi.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

import 'hammerjs';
import * as urlencode from 'urlencode';
import * as _ from 'lodash';

import sha512 from 'js-sha512';

import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { IMAGEVIEWER_CONFIG, ImageViewerConfig, ButtonConfig } from '@hallysonh/ngx-imageviewer';
window;
const IMAGEVIEWER_CONFIG_DEFAULT: ImageViewerConfig = {
  width: 800, // component default width
  height: 600, // component default height
  bgStyle: '#ECEFF1', // component background style
  scaleStep: 0.1, // zoom scale step (using the zoom in/out buttons)
  rotateStepper: false, // touch rotate should rotate only 90 to 90 degrees
  loadingMessage: 'Loading...',
  // buttonStyle: {
  //   iconFontFamily: 'Material Icons', // font used to render the button icons
  //   alpha: 0.5, // buttons' transparence value
  //   hoverAlpha: 0.7, // buttons' transparence value when mouse is over
  //   bgStyle: '#000000', //  buttons' background style
  //   iconStyle: '#ffffff', // buttons' icon colors
  //   borderStyle: '#000000', // buttons' border style
  //   borderWidth: 0 
  // },
  // tooltips: {
  //   enabled: true, // enable or disable tooltips for buttons
  //   bgStyle: '#000000', // tooltip background style
  //   bgAlpha: 0.5, // tooltip background transparence
  //   textStyle: '#ffffff', // tooltip's text style
  //   textAlpha: 0.9, // tooltip's text transparence
  //   padding: 15, // tooltip padding
  //   radius: 20 // tooltip border radius
  // },
  zoomOutButton: { // zoomOut button config
    icon: 'zoom_out', // icon text
    tooltip: 'Zoom out', // button tooltip
    sortId: 0, // number used to determine the order of the buttons
    show: false // used to show/hide the button
  },
 
  // // short button configuration
  // nextPageButton: createButtonConfig('navigate_next', 'Next page', 0),
  // beforePageButton: createButtonConfig('navigate_before', 'Previous page', 1),
  zoomInButton: {show:false},
  rotateLeftButton: {show:false},
  rotateRightButton: {show:false},
  resetButton: {show:false}
};

@Component({
  selector: 'app-kycwithsidebar',
  templateUrl: './kycwithsidebar.component.html',
  styleUrls: ['./kycwithsidebar.component.css'],
  providers:[SignupService,ServiceapiService,
    {
      provide: IMAGEVIEWER_CONFIG,
      useValue: IMAGEVIEWER_CONFIG_DEFAULT
    }
  ]
})
export class KycwithsidebarComponent implements OnInit {
  
    form: FormGroup;
    ProofFiles:File;
  
    @ViewChild('fileInput1') fileInput1: ElementRef; 
    @ViewChild('fileInput2') fileInput2: ElementRef;
  
    name:string; 
    aadharno:number;
    pan:any;
    idproof:any;
  
    errmsg:any;sucmsg:any;
    loadingimage:boolean = false;

    public ngxloading  = false;

    dumimg:any = 'assets/img/kyc3.jpg';

    modalRef: BsModalRef;
    @ViewChild('imagemodal') imagemodal:ElementRef;
    config2 = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    };
    kycimg:any = 'assets/img/kyc3.jpg';

    imgavailable:number = 1;

    kycstatus:any;
    kycdatapoi:any = [];
    kycdatapoa:any = [];

    nokycmessage:any = 'Loading... KYC documents';

    constructor(
      private fb: FormBuilder,
      public signup:SignupService,
      public api:ServiceapiService,
      private route: ActivatedRoute,
      private router: Router,
      private toastr: ToastrService,
      private storage:LocalStorageService,
      private modalService: BsModalService,
    ) { 
      this.form = this.fb.group({
        // name:['',Validators.required],
        // aadharno:['',Validators.required],
        pan:null,
        idproof:null,
        // proof1:null,
        // proof2:null
      });
    }
  
    ngOnInit() {
      // let a = this.signup.retrieveFromLocal("AUXKYCStatus"); 
      // if(a=="done"){
      //   this.router.navigate(["login"]);
      // }
  
      this.loadAlert();
  
      this.signup.checkActivity();
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

      this.findKYCs();
    }

    findKYCs(){
      this.ngxloading = true; 
      let d = {
        'email':this.signup.retrieveFromLocal("AUXUserEmail"),
        'token':this.signup.retrieveFromLocal("AUXHomeUserToken")
      };
      // console.info(d);
      this.api.resolveApi("user_kyc_details/",d)
      .subscribe(
        res=>{
          // console.info(res);
          
          let dt = JSON.parse(JSON.stringify(res));
          this.ngxloading = false;  
          if(dt.code == 200){
            let kyclist = dt.kyc_details;
            if(kyclist.length == 0 || kyclist.kyc == null || kyclist == null || kyclist == ""){
              this.imgavailable=1;
              // console.log(dt.code,kyclist.length,kyclist.kyc)
              this.nokycmessage = 'No kyc detail has been yet uploaded';
            }else{
              this.imgavailable=0;
              // console.log(dt.code,kyclist.length)
              this.kycstatus = kyclist.kyc.status;

              let proofaddress = kyclist.kyc.aadhar_card_details;
              // console.log(proofaddress,proofaddress.length)
              let arr1 = [];
              if(proofaddress.length>0){
                _.forEach(proofaddress,(value,key)=>{
                  let type = value.filetype;
                  let imgpath = '';
                  if(type == "png" || type == "image/png"){
                    type = "png";
                    imgpath = 'data:image/png;base64,';
                  }
                  if(type == "jpeg" || type=="jpg" || type == "image/jpeg" || type == "image/jpg"){
                    type = "jpeg";
                    imgpath = 'data:image/jpeg;base64,';
                  }
                  if(type == "pdf" || type == "application/pdf"){
                    type = "pdf";
                    imgpath = 'data:application/pdf;base64,';
                  }
                  arr1.push({
                    rowid:(key+1),
                    filename:value.filename,
                    filesize:value.filesize,
                    filetype:type,
                    name:value.name,
                    path:value.path,
                    value:imgpath+value.value
                  });
                });
                this.kycdatapoi = arr1;
              }else{
                this.kycdatapoi = [];
                this.nokycmessage = 'No kyc detail has been found';
              }
              let proofid = kyclist.kyc.pan_card_details;
              let type2 = proofid.filetype;
              let imgpath2 = '';
              if(type2 == "png" || type2 == "image/png"){
                type2 = "png";
                imgpath2 = 'data:image/png;base64,';
              }
              if(type2 == "jpeg" || type2=="jpg" || type2 == "image/jpeg" || type2 == "image/jpg"){
                type2 = "jpeg";
                imgpath2 = 'data:image/jpeg;base64,';
              }
              if(type2 == "pdf" || type2 == "application/pdf"){
                type2 = "pdf";
              }
              this.kycdatapoa.push({
                rowid:(1),
                filename:proofid.filename,
                filesize:proofid.filesize,
                filetype:type2,
                name:proofid.name,
                path:proofid.path,
                value:imgpath2+proofid.value
              });

              // console.log(this.kycdatapoi,this.kycdatapoa)
            }
          }else if(dt.code == 401){
            this.imgavailable=1;
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.imgavailable=1;
            this.nokycmessage = 'No kyc detail has been found';
            this.toastr.error('KYC documents not found', null,{timeOut:2500});
          }
        },
        err=>{
            this.ngxloading = false; 
            // console.error(err);
            this.imgavailable=1;
            this.nokycmessage = 'No kyc detail has been found';
            this.toastr.error('KYC documents not found', null,{timeOut:2500});
        }
      );
    }
  
    failmsg(msg){
      this.errmsg = msg;
      setTimeout(()=>{
        this.errmsg = "";
      },2000);
    }
  
    skipfornow(){
      this.storage.store("AUXAuthLogin",true);
      this.signup.saveToLocal("AUXKYCStatus","nokyc");   //for page             
      this.signup.saveToLocal("AUXTNCStatus","done");  
      this.signup.saveToLocal("AUXHomeStatus","nokyc"); 
      this.router.navigate(["/home"]);
    }
  
    onFileChange1(event) {
      let reader = new FileReader();
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        // console.log(file,event)
        if(file.size > 1000000){
          // this.failmsg("File size can not be greater than 1 Mb");
          this.toastr.error('File size can not be greater than 1 Mb',null,{timeOut:2500});          
          this.form.get('pan').setValue(null);
          this.fileInput1.nativeElement.value = "";
          return false;
        }else{
          reader.readAsDataURL(file);
          reader.onload = () => {
            // console.log(file.type)
            this.form.get('pan').setValue({
              filename: file.name,
              filetype: file.type,
              filesize: file.size,
              value: reader.result.split(',')[1]
            }) 
          };
        }
      }
    }
    onFileChange3(event) {
      let reader = new FileReader();
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.form.get('proof1').setValue({
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            value: reader.result.split(',')[1]
          })
        };
      }
    }
    onFileChange4(event) {
      let reader = new FileReader();
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.form.get('proof2').setValue({
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            value: reader.result.split(',')[1]
          })
        };
      }
    }
    onFileChange23(event) {
      let reader = new FileReader();
      const formData = new FormData();
      //console.log(event.target.files);
      if(event.target.files && event.target.files.length > 0) {
        let array = event.target.files;
        let arrayLength = event.target.files.length;
  
  
        let putArray = [];
        if(arrayLength <= 2){
          for(let a = 0;a<arrayLength;a++){
            let file = event.target.files[a];
            //console.log(file);
            
              if(file.size > 10000){
                //console.log("File size can not be greater than 25 kb");
                this.failmsg("File size can not be greater than 10 kb");
                this.form.get('idproof').setValue(null);
                this.fileInput2.nativeElement.value = "";
                return false;
              }else{
                //formData.append('idproof',file);
                setTimeout(()=>{
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    //console.log(reader.result);
                    putArray.push({
                        filename: file.name,
                        filetype: file.type,
                        filesize: file.size,
                        value: reader.result.split(',')[1]
                    });
                  }
                },5000);
              }
          }
        }else{
          this.failmsg("You can only upload two files");
          this.form.get('idproof').setValue(null);
          this.fileInput2.nativeElement.value = "";
          return false;
        }
        //console.log(putArray);
        this.form.get('idproof').setValue(putArray);
  
        //for(let a in formData){
          //console.log(formData.get("idproof"));
        //}
        // let file = event.target.files[0];
        // console.log(file);
        // reader.readAsDataURL(file);
        // reader.onload = () => {
        //   this.form.get('idproof').setValue({
        //     filename: file.name,
        //     filetype: file.type,
        //     value: reader.result.split(',')[1]
        //   })
        // };
      }
    }
    onFileChange2(event) {
      let reader = new FileReader();
      let reader2 = new FileReader();
      const formData = new FormData();
      //console.log(event.target.files);
      if(event.target.files && event.target.files.length > 0) {
        let array = event.target.files;
        let arrayLength = event.target.files.length;
  
  
        let putArray = [];
        if(arrayLength <= 2){
          //for(let a = 0;a<arrayLength;a++){
            let file1 = event.target.files[0];
            let file2 = event.target.files[1];
            //console.log(file);
            
              if(file1.size > 1000000 || file2 > 1000000){
                //console.log("File size can not be greater than 25 kb");
                // this.failmsg("File size can not be greater than 1 Mb");
                this.toastr.error('File size can not be greater than 1 Mb',null,{timeOut:2500}); 
                this.form.get('idproof').setValue(null);
                this.fileInput2.nativeElement.value = "";
                return false;
              }else{
                //formData.append('idproof',file);
                
                  reader.readAsDataURL(file1);
                  reader.onload = () => {
                    console.log(file1.type);
                    putArray.push({
                        filename: file1.name,
                        filetype: file1.type,
                        filesize: file1.size,
                        value: reader.result.split(',')[1]
                    });
                  }
                if(arrayLength == 2){
                setTimeout(()=>{
                  //console.log("called");
                  reader2.readAsDataURL(file2);
                  reader2.onload = () => {
                    //console.log(reader.result);
                    putArray.push({
                        filename: file2.name,
                        filetype: file2.type,
                        filesize: file2.size,
                        value: reader2.result.split(',')[1]
                    });
                  }
                },1000);
                }
              }
          //}
        }else{
          // this.failmsg("You can only upload two files");
          this.toastr.error('You can only upload two files',null,{timeOut:2500}); 
          this.form.get('idproof').setValue(null);
          this.fileInput2.nativeElement.value = "";
          return false;
        }
        //console.log(putArray);
        this.form.get('idproof').setValue(putArray);
      }
    }
    clearFile() {
      this.form.get('pan').setValue(null);
      this.form.get('idproof').setValue(null);
      this.fileInput1.nativeElement.value = '';
      this.fileInput2.nativeElement.value = '';
    }
  
    signup_v2(){
      //console.log(this.name+" \n"+this.aadharno+" \n"+this.pan+" \n"+this.idproof)
      //console.log(this.form)
      const formModel = this.form.value;
      if(formModel.idproof == null){
        this.toastr.error('Proof for KYC is required, try to attach it...',null,{timeOut:2500}); 
        // this.failmsg("Proof of addresses can not be left blank try to attach it...");
        setTimeout(()=>{
          if(formModel.idproof != null){
            // this.sucmsg = "Now you can submit the details";
            // setTimeout(function() {
            //   this.sucmsg = "";
            // }, 1000);
          }
        },10000);
      }
      // else if(formModel.name == "" || formModel.name == null){
      //   this.failmsg("Name can not be left blank");
      // }else if(formModel.aadharno == "" || formModel.aadharno == null){
      //   this.failmsg("Aadhar number can not be left blank");
      // }
      else if(formModel.pan == null){
        // this.failmsg("Id proof not picked try to attach it...");
        this.toastr.error('Id proof not picked try to attach it...',null,{timeOut:2500}); 
      }else{
        //console.log(formModel)
        this.loadingimage = true;
        let data = {
          // 'name':formModel.name,
          'email':localStorage.getItem("AUXUserEmailLocal"),
          // 'aadhar_no':formModel.aadharno,
          'idproofs':formModel.idproof,
          // 'aadhar_card_front':formModel.proof1,
          // 'aadhar_card_back':formModel.proof2,
          'pan_card':formModel.pan
        };
        //console.log(data);
        //console.log(JSON.stringify(formModel.idproof[0].value));
        //console.log(JSON.stringify(formModel.idproof[1].value));
        //console.log(JSON.stringify(data));
        //console.log(JSON.stringify(formModel.pan.value));
        this.signup.makeKYC(data)
        .then(
          (res)=>{
            //console.log(res);
            let r = JSON.parse(JSON.stringify(res));
            if((r.code == 200 && r.kyc == "pending") || (r.code == 200 && r.kyc == "rejected")){
              this.signup.saveToLocal("AUXHomeStatus","pending");
              // this.sucmsg = "KYC detail submitted successfully wait after administrator verified.\nWe redirecting to your dashboard...";
              // setTimeout(()=>{
                // this.sucmsg;              
                let msgToPass = "KYC is updated. You can continue buying MASS Coins.";
                this.signup.setRouteMsgPass(msgToPass);
                this.storage.store("AUXAuthLogin",true);
                this.signup.saveToLocal("AUXKYCStatus","done");   //for page             
                this.signup.saveToLocal("AUXTNCStatus","done");  
                this.signup.saveToLocal("AUXHomeStatus","pending"); 
                this.router.navigate(["/home"]);
              // },3500);
            }else if( (r.code == 400 && r.kyc == "pending") || r.status == "already_done"){
              // this.failmsg("KYC is waiting for administrator approval. You can continue buying MASS Coins.");
              // setTimeout(()=>{
                let msgToPass = "KYC is updated. You can continue buying MASS Coins.";
                this.signup.setRouteMsgPass(msgToPass);
                this.storage.store("AUXAuthLogin",true);
                this.signup.saveToLocal("AUXKYCStatus","done");                
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.signup.saveToLocal("AUXHomeStatus","pending"); //for kyc current
                this.router.navigate(["/home"]);
              // },2010);
            }else{
              this.failmsg("KYC is waiting for administrator approval. You can continue buying MASS Coins.");
              // setTimeout(()=>{
                this.storage.store("AUXAuthLogin",true);
                this.signup.saveToLocal("AUXKYCStatus","done");                
                this.signup.saveToLocal("AUXTNCStatus","done");
                this.signup.saveToLocal("AUXHomeStatus","pending"); //for kyc current
                this.router.navigate(["/home"]);
            }
            this.loadingimage = false;
          },
          (err)=>{
            this.loadingimage = false;
            // this.failmsg("Network interuptted to submit KYC detail try again.");
            //console.log(err);
            this.toastr.error('Network interuptted to submit KYC detail try again.',null,{timeOut:2500});         
          }
        )
        .catch((err)=>{
          this.loadingimage = false;
          // this.failmsg("Network interuptted to submit KYC detail try again.");
          this.toastr.error('Network interuptted to submit KYC detail try again.',null,{timeOut:2500}); 
          //console.log(err);
        });
      }
    }
  
    signup_v22(){
      const Image = this.fileInput2.nativeElement;
      ///console.log(Image.files);
      if(Image.files){
        this.ProofFiles = Image.files[0];
      }
      const ImageFile:File = this.ProofFiles;
      //console.log(ImageFile)
    }
  
    hideme(){
      this.modalRef.hide();
    }

    showme(val){
      if(val.filetype == "pdf"){
        // location.href = val.value;
        // console.log(val.value)
        // var myWindow = window.open(val.value);//, "KYC Documents", "width=800,height=600,fullscreen=no,top=50,left=300,resizable=no");
        // this.api.saveToLocal("AUXDOCImageAddressProof",val.value);
        // this.router.navigate(["/updatekyc/view/",val.value]);

        let name = this.signup.retrieveUsername("AUXMassUserName");
        let email  = this.storage.retrieve("AUXUserEmail");
        let filename = name.toString().replace(" ","-")+"-"+email;//sha512(email);
        this.downloadURI(val.value, filename+".pdf");

      }else{
        this.modalRef = this.modalService.show(
          this.imagemodal,
            Object.assign({}, this.config2, { class: 'gray modal-lg' })
        );
        this.kycimg = val.value;
      }
    }

    downloadFile(val){
      let name = this.signup.retrieveUsername("AUXMassUserName");
      let email  = this.storage.retrieve("AUXUserEmail");
      let filename = name.toString().replace(" ","-")+"-"+email;//sha512(email);
      this.downloadURI(val, filename+".png");
    }

    downloadURI(uri, name) {
      var link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // delete link;
    }
  }
  