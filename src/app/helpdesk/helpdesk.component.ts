import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';

import { PouchService } from '../services/pouch.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
@Component({
  selector: 'app-helpdesk',
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css'],
  providers:[ServiceapiService,PouchService,SignupService]
})
export class HelpdeskComponent implements OnInit {

  public errmsg:any;public sucmsg:any;
  public mssg:string = "";

  loadingimage:boolean = false;

  public ngxloading  = false;
  
  @ViewChild('successmodal') successmodal:ElementRef;
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };

  formHelp:FormGroup;
  @ViewChild('fileInput2') fileInput2: ElementRef;

  @ViewChild('actiontemplate') actiontemplate:ElementRef;
  modalRefAction: BsModalRef;
  configAction = {
    animated:true,
    keyboad:true,
    backdrop:true,
    ignoreBackdropClick:true
  }

  @ViewChild('selectAction') selectAction:ElementRef;

  acvalue = 'Select';
  acappendvalue = '';

  constructor(
    public serv:ServiceapiService,
    public signup:SignupService,
    public pouchserv:PouchService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private storage:LocalStorageService,
    private formBuilder:FormBuilder,
    private modalService: BsModalService,
  ) {

    this.formHelp = formBuilder.group({
      category:['',Validators.compose([Validators.required])],
      subject:['',Validators.compose([Validators.required])],
      phone:['',Validators.compose([Validators.nullValidator])],
      message:['',Validators.compose([Validators.required])],
      attachment:['',Validators.compose([Validators.nullValidator])]
    });
  }

  ngOnInit() {
    this.loadHelpAuth();
    this.signup.checkActivity();
  }

  loadHelpAuth(){
    let isAuth = this.storage.retrieve("MoneroAUXAuthLogin");
    let cookieExists = this.signup.checkUserActivity();
    if(isAuth == null){
      this.signup.UnAuthlogoutFromApp(); 
    }
    else if(cookieExists == false){
      this.storage.store("MoneroAUXAuthLogin",false);
      this.signup.UnAuthlogoutFromApp();
    }
    else{
      // console.log("isAuthorized",isAuth,cookieExists);
      this.loadAlert();
    }
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

    this.findhelpdesk();
  }

  findhelpdesk(){
    this.ngxloading = true; 
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
    };
    console.info(d);
    this.ngxloading = false;     
  }

  raisemodal(modal){
    this.modalRef = this.modalService.show(
      modal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
  }

  hideme(){
    this.modalRef.hide();
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
              this.formHelp.get('attachment').setValue(null);
              this.fileInput2.nativeElement.value = "";
              return false;
            }else{
              //formData.append('idproof',file);
              
                reader.readAsDataURL(file1);
                reader.onload = () => {
                  // console.log(file1.type);
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
              },10);
              }
            }
        //}
      }else{
        // this.failmsg("You can only upload two files");
        this.toastr.error('You can only upload two files',null,{timeOut:2500}); 
        this.formHelp.get('attachment').setValue(null);
        this.fileInput2.nativeElement.value = "";
        return false;
      }
      //console.log(putArray);
      this.formHelp.get('attachment').setValue(putArray);
    }
  }

  callhelpdesk(){
    this.loadingimage = true;
    console.log(this.formHelp.value)
    if(this.formHelp.valid){
      setTimeout(()=>{
        this.loadingimage = false;
        this.toastr.info("Adding",null,{timeOut:2000});
      },2000);
    }else{
      this.toastr.error("Invalid details to raise a ticket",null,{timeOut:2000});
    }
  }

  actionchange(event,val){
    console.log(event,val)
    if(val == 0){
    }else{
      this.modalRefAction = this.modalService.show(
        this.actiontemplate,
          Object.assign({}, this.config, { class: 'gray modal-md' })
      );
    }
  }

  confirmaction(){
    this.modalRefAction.hide();
    console.log(this.selectAction.nativeElement.value)
    this.postAction();
  }

  declineaction(){
    // this.selectAction.nativeElement.value = 'Select';
    console.log(this.selectAction.nativeElement.value)
    // this.acappendvalue = 0;
    this.modalRefAction.hide(); 
  }

  postAction(){
    this.ngxloading = true;
    setTimeout(()=>{
      this.ngxloading = false;
    },2500);
  }

}
