import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import { SignupService } from '../services/signup.service';
import { ServiceapiService } from '../services/serviceapi.service';
import { PouchService } from '../services/pouch.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
@Component({
  selector: 'app-userkyc',
  templateUrl: './userkyc.component.html',
  styleUrls: ['./userkyc.component.css'],
  providers:[SignupService,ServiceapiService,PouchService]
})
export class UserkycComponent implements OnInit {

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
  constructor(
    private fb: FormBuilder,
    public signup:SignupService,
    public api:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
    private storage:LocalStorageService,
    public pouchserv:PouchService
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
    let isAuth = this.storage.retrieve("MoneroAUXAuthLogin");
    if(isAuth == true){
      this.router.navigate(["home"]);
    }else{
      this.router.navigate(["login"]);
    }
    let a = this.signup.retrieveFromLocal("MoneroAUXKYCStatus"); 
    if(a=="done"){
      this.router.navigate(["login"]);
    }

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
  }

  failmsg(msg){
    this.errmsg = msg;
    setTimeout(()=>{
      this.errmsg = "";
    },2000);
  }

  skipfornow(){
    this.storage.store("MoneroAUXAuthLogin",true);
    this.signup.saveToLocal("MoneroAUXKYCStatus","nokyc");   //for page             
    this.signup.saveToLocal("MoneroAUXTNCStatus","done");  
    this.signup.saveToLocal("MoneroAUXHomeStatus","nokyc"); 
    this.router.navigate(["/home"]);
  }

  onFileChange1(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      // console.log(file,event)
      if(file.size > 1000000){
        this.failmsg("File size can not be greater than 1 Mb");
        this.form.get('pan').setValue(null);
        this.fileInput1.nativeElement.value = "";
        return false;
      }else{
        // console.log(reader)
        reader.readAsDataURL(file);
        reader.onload = () => {
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
              this.failmsg("File size can not be greater than 1 Mb");
              this.form.get('idproof').setValue(null);
              this.fileInput2.nativeElement.value = "";
              return false;
            }else{
              //formData.append('idproof',file);
              
                reader.readAsDataURL(file1);
                reader.onload = () => {
                  //console.log(reader.result);
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
        this.failmsg("You can only upload two files");
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
      this.failmsg("Proof for KYC is required, try to attach it...");
      setTimeout(()=>{
        if(formModel.idproof != null){
          this.sucmsg = "Now you can submit the details";
          setTimeout(function() {
            this.sucmsg = "";
          }, 1000);
        }
      },10000);
    }
    // else if(formModel.name == "" || formModel.name == null){
    //   this.failmsg("Name can not be left blank");
    // }else if(formModel.aadharno == "" || formModel.aadharno == null){
    //   this.failmsg("Aadhar number can not be left blank");
    // }
    else if(formModel.pan == null){
      this.failmsg("Id proof not picked try to attach it...");
    }else{
      //console.log(formModel)
      this.loadingimage = true;
      let data = {
        // 'name':formModel.name,
        'email':localStorage.getItem("MoneroAUXUserEmailLocal"),
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
            this.signup.saveToLocal("MoneroAUXHomeStatus","pending");
            // this.sucmsg = "KYC detail submitted successfully wait after administrator verified.\nWe redirecting to your dashboard...";
            // setTimeout(()=>{
              // this.sucmsg;              
              let msgToPass = "KYC is waiting for administrator approval. You can continue buying XMRC Coins.";
              this.signup.setRouteMsgPass(msgToPass);
              this.storage.store("MoneroAUXAuthLogin",true);
              this.signup.saveToLocal("MoneroAUXKYCStatus","done");   //for page             
              this.signup.saveToLocal("MoneroAUXTNCStatus","done");  
              this.signup.saveToLocal("MoneroAUXHomeStatus","pending"); 
              this.router.navigate(["/home"]);
            // },3500);
          }else if( (r.code == 400 && r.kyc == "pending") || r.status == "already_done"){
            this.failmsg("KYC is waiting for administrator approval. You can continue buying XMRC Coins.");
            // setTimeout(()=>{
              this.storage.store("MoneroAUXAuthLogin",true);
              this.signup.saveToLocal("MoneroAUXKYCStatus","done");                
              this.signup.saveToLocal("MoneroAUXTNCStatus","done");
              this.signup.saveToLocal("MoneroAUXHomeStatus","pending"); //for kyc current
              this.router.navigate(["/home"]);
            // },2010);
          }else{
            this.failmsg("KYC is waiting for administrator approval. You can continue buying XMRC Coins.");
            // setTimeout(()=>{
              this.storage.store("MoneroAUXAuthLogin",true);
              this.signup.saveToLocal("MoneroAUXKYCStatus","done");                
              this.signup.saveToLocal("MoneroAUXTNCStatus","done");
              this.signup.saveToLocal("MoneroAUXHomeStatus","pending"); //for kyc current
              this.router.navigate(["/home"]);
          }
          this.loadingimage = false;
        },
        (err)=>{
          this.loadingimage = false;
          this.failmsg("Network interuptted to submit KYC detail try again.");
          //console.log(err);
          this.pouchserv.putErrorInPouch("signup_v2()","Response error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
          
        }
      )
      .catch((err)=>{
        this.loadingimage = false;
        this.failmsg("Network interuptted to submit KYC detail try again.");
        //console.log(err);
        this.pouchserv.putErrorInPouch("signup_v2()","Catch throws error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
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

}
