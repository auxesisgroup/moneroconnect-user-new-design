import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ServiceapiService } from '../services/serviceapi.service';
import { SignupService } from '../services/signup.service';
import { ActivityService } from '../services/activity.service';

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
window;
@Component({
  selector: 'app-helpdesk',
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css'],
  providers:[ServiceapiService,PouchService,SignupService,ActivityService]
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


  categorylistoption:any = [];
  user_tickets_list:any = [];
  user_tickets_listshow:number = 2;

  ticketActionMessage:any;
  ticketActionKey:any;
  ticketActionID:any;

  initialcategory:boolean = false;
  @ViewChild('panelScroll') private panelScroll:ElementRef;

  @ViewChild('ticketmodal') ticketmodal:ElementRef;
  modalTicketAction: BsModalRef;
  ticketModalData:any = [];



  @ViewChild('chatview') public chatview:ElementRef;
  username:string;
  chatTicketPanel:number = 0;
  chatTicketID:any;
  chatTicketeMessages:any = [];
  sendtext:any;
  chatinterval;
  
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
    public activityServ:ActivityService
  ) {

    this.formHelp = formBuilder.group({
      category:['',Validators.compose([Validators.required])],
      subject:['',Validators.compose([Validators.required])],
      phone:[,Validators.compose([Validators.nullValidator])],
      message:['',Validators.compose([Validators.required])],
      // attachment:['',Validators.compose([Validators.nullValidator])]
    });

    // this.pouchserv.storeIP();
  }

  ngOnInit() {
    this.loadHelpAuth();
    this.signup.checkActivity();
    // this.chatview.nativeElement.style.width = "400px";    
    this.chatview.nativeElement.style.display = "none"; 
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
      // // console.log("isAuthorized",isAuth,cookieExists);
      this.loadAlert();  
      let name = this.signup.retrieveUsername("MoneroAUXMassUserName");
      let splitname = name.split(" ");
      // console.log(splitname)
      this.username = splitname[0];
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
    this.findhelpdeskTickets();
  }

  findhelpdesk(){
    this.ngxloading = true; 
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("display_category/",d)
    .subscribe(
      res=>{
        this.ngxloading = false;  
        let response = JSON.parse(JSON.stringify(res));
        // // console.log(response)
        if(response != null || response != ""){
          // // console.log(response);
          if(response.code == 200){
            let list = response.categories_list;
            this.categorylistoption = [];
            _.forEach(list,(value,key)=>{
              var c = value.category;
              if(c == 'Payment'){
                this.initialcategory = true;
              }else{
                this.initialcategory = false;
              }
              this.categorylistoption.push({
                rowid:(key+1),
                category:value.category,
                id:value._id,
                initialcategory:this.initialcategory
              })
            });
            // console.log(this.categorylistoption)
          }else if(response.code == 400){
            // this.toastr.error('Unable to find category', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // this.toastr.error('Unable to find category', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // // console.log(response);
          // this.toastr.error('Unable to find category', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        this.ngxloading = false;  
          // console.error(err);
          // this.toastr.error('Unable to find category', 'Abandoned!',{timeOut:2500});
          // this.pouchserv.putErrorInPouch("findhelpdesk()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );   
  }

  findhelpdeskTickets(){
    this.ngxloading = true; 
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken")
    };
    // console.info(d);
    this.serv.resolveApi("display_tickets_to_user/",d)
    .subscribe(
      res=>{
        this.ngxloading = false;  
        let response = JSON.parse(JSON.stringify(res));
        // // console.log(response)
        if(response != null || response != ""){
          // // console.log(response);
          if(response.code == 200){
            let list = response.user_tickets_list;
            if(list.length>0){
              this.user_tickets_list = [];
              let dd = [];
              _.forEach(list,(value,key)=>{
                var desc = '';
                var descl = (value.description).toString();
                if(descl.length>20){
                  desc = descl.toString().substr(0,20)+'...';
                }else{
                  desc = descl;
                }
                dd.push({
                  rowid:(key+1),
                  category:value.category,
                  id:value._id,
                  email:value.email,
                  subject:value.subject,
                  phone:value.phone,
                  description:value.description,
                  shortdesc:desc,
                  timestamp:this.convertToDate(value.timestamp),
                  epoch:value.timestamp,
                  status:value.status
                })

              });
              dd = _.orderBy(dd,['epoch'],['desc']);
              this.user_tickets_list = dd;
              this.user_tickets_listshow = 1;
            }else{
              this.user_tickets_listshow = 0;
              this.toastr.info('No raised tickets', 'Abandoned!',{timeOut:2500});
            }
          }else if(response.code == 400){
            this.user_tickets_listshow = 0;
            this.toastr.error('Unable to find raised tickets', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.user_tickets_listshow = 0;
            this.toastr.error('Unable to find raised tickets', 'Abandoned!',{timeOut:2500});
          }
        }else{
          this.user_tickets_listshow = 0;
          // // console.log(response);
          this.toastr.error('Unable to find raised tickets', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        this.user_tickets_listshow = 0;
        this.ngxloading = false;  
          // console.error(err);
          this.toastr.error('Unable to find raised tickets', 'Abandoned!',{timeOut:2500});
          // this.pouchserv.putErrorInPouch("findhelpdeskTickets()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );   
  }

  convertToDate(timestamp){
    let date = moment.unix(timestamp).fromNow();//.format("MMM Do, YYYY");
    return date;
  }

  raisemodal(modal){
    this.modalRef = this.modalService.show(
      modal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
    this.activityServ.putActivityInPouch("HelpdeskComponent","raisemodal()","Open the modal to raise help","");
  }

  hideme(){
    this.modalRef.hide();
  }

  onFileChange2(event) {
    let reader = new FileReader();
    let reader2 = new FileReader();
    const formData = new FormData();
    //// console.log(event.target.files);
    if(event.target.files && event.target.files.length > 0) {
      let array = event.target.files;
      let arrayLength = event.target.files.length;


      let putArray = [];
      if(arrayLength <= 2){
        //for(let a = 0;a<arrayLength;a++){
          let file1 = event.target.files[0];
          let file2 = event.target.files[1];
          //// console.log(file);
          
            if(file1.size > 1000000 || file2 > 1000000){
              //// console.log("File size can not be greater than 25 kb");
              // this.failmsg("File size can not be greater than 1 Mb");
              this.toastr.error('File size can not be greater than 1 Mb',null,{timeOut:2500}); 
              this.formHelp.get('attachment').setValue(null);
              this.fileInput2.nativeElement.value = "";
              return false;
            }else{
              //formData.append('idproof',file);
              
                reader.readAsDataURL(file1);
                reader.onload = () => {
                  // // console.log(file1.type);
                  putArray.push({
                      filename: file1.name,
                      filetype: file1.type,
                      filesize: file1.size,
                      value: reader.result.split(',')[1]
                  });
                }
              if(arrayLength == 2){
              setTimeout(()=>{
                //// console.log("called");
                reader2.readAsDataURL(file2);
                reader2.onload = () => {
                  //// console.log(reader.result);
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
      //// console.log(putArray);
      this.formHelp.get('attachment').setValue(putArray);
    }
  }

  callhelpdesk(){
    this.loadingimage = true;
    // console.log(this.formHelp.value)
    if(this.formHelp.valid){
      // setTimeout(()=>{
        this.loadingimage = false;
        if(this.formHelp.value.category == 0){
          this.toastr.warning("Please choose a category",null,{timeOut:2000});          
        }else{
          if(this.formHelp.value.phone == null || this.formHelp.value.phone == ""){
            this.postTicket();
          }else{
            console.log(this.formHelp.value.phone)
            this.formHelp.get('phone').setValue((this.formHelp.value.phone).toString());
            if((this.formHelp.value.phone).toString().length == 10){
              this.postTicket();         
            }else{
              this.toastr.warning("Phone number will be 10 digit",null,{timeOut:2000}); 
            }
          }
        }
        // this.toastr.info("Adding",null,{timeOut:2000});
      // },2000);
    }else{
      this.loadingimage = false;
      // console.log((this.formHelp.value))
      if(this.formHelp.value.category == 0 || this.formHelp.value.category == '' || this.formHelp.value.category == '0' || this.formHelp.value.category == null){
        this.toastr.warning("Please choose a category",null,{timeOut:2000});          
      }
      else if(this.formHelp.value.subject == null || this.formHelp.value.subject == ""){
        this.toastr.warning("Subject is required",null,{timeOut:2000});                  
      }
      else if(this.formHelp.value.message == null || this.formHelp.value.message == ""){
        this.toastr.warning("Message is required",null,{timeOut:2000});                  
      }
      else if(this.formHelp.value.phone != null || this.formHelp.value.phone != ""){
        if(this.formHelp.value.phone==null){
          this.toastr.warning("Phone number will be 10 digit",null,{timeOut:2000});                    
        }else{
          if((this.formHelp.value.phone).toString().length != 10){
            this.toastr.warning("Phone number will be 10 digit",null,{timeOut:2000});          
          }else{
            this.toastr.warning("Phone number will be 10 digit",null,{timeOut:2000});                  
          }    
        }
      
      console.log(this.formHelp.value.phone)
      }else{
        this.toastr.error("Invalid details to raise a ticket",null,{timeOut:2000});
      }
    }
  }
  postTicket(){
    this.loadingimage = true; 
    let d;
    if(this.formHelp.value.phone == null || this.formHelp.value.phone == ""){
      d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'issue_category':this.formHelp.value.category,
        'subject':this.formHelp.value.subject,
        'description':this.formHelp.value.message
      };
    }else{
      d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'issue_category':this.formHelp.value.category,
        'subject':this.formHelp.value.subject,
        'phone':this.formHelp.value.phone,
        'description':this.formHelp.value.message
      };
    }
   //  console.info(d);
    this.activityServ.putActivityInPouch("HelpdeskComponent","postTicket()","Submitting the help details to raise ticket","Details are, "+JSON.stringify(this.formHelp.value));
    
    this.serv.resolveApi("raise_ticket/",d)
    .subscribe(
      res=>{
        this.loadingimage = false;  
        let response = JSON.parse(JSON.stringify(res));
        // console.log(response)
        if(response != null || response != ""){
          // // console.log(response);
          if(response.code == 200){
            this.hideme();
            this.toastr.success('Successful','Ticket no '+response.ticket_no+' is raised successfully',{timeOut:2000});
            this.findhelpdeskTickets();
            this.formHelp.controls['category'].setValue('');
            this.formHelp.controls['subject'].setValue('');
            this.formHelp.controls['phone'].setValue('');
            this.formHelp.controls['message'].setValue('');
          }else if(response.code == 400){
            this.toastr.error('Unable to raise ticket', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.toastr.error('Unable to raise ticket', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // // console.log(response);
          this.toastr.error('Unable to raise ticket', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        this.loadingimage = false;  
          // console.error(err);
          this.toastr.error('Unable to raise ticket', 'Abandoned!',{timeOut:2500});
          this.pouchserv.putErrorInPouch("findhelpdesk()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );   
  }

  actionchange(event,val){
    // console.log(event,val)
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
    // // console.log(this.selectAction.nativeElement.value)
    this.postAction();
  }

  declineaction(){
    // this.selectAction.nativeElement.value = 'Select';
    // // console.log(this.selectAction.nativeElement.value)
    // this.acappendvalue = 0;
    this.activityServ.putActivityInPouch("HelpdeskComponent","declineaction()","Attempt to "+this.ticketActionKey+" ticket with decline","");
    
    this.ticketActionMessage = null;
    this.ticketActionKey = null;
    this.ticketActionID = null;
    this.modalRefAction.hide(); 
  }

  postAction(){
    this.ngxloading = true; 
    let method = '';let d;
    this.activityServ.putActivityInPouch("HelpdeskComponent","postAction()","Attempt to "+this.ticketActionKey+" ticket with confirm","");
    
    if(this.ticketActionKey == 'close'){
      d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.ticketActionID
      };
      method = 'close_ticket/';
    }else if(this.ticketActionKey == 'open'){
      d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.ticketActionID
      };
      method = 'reopen_ticket/';
    }
    // console.info(d,method);
    this.serv.resolveApi(method,d)
    .subscribe(
      res=>{
        this.ngxloading = false;  
        let response = JSON.parse(JSON.stringify(res));
        // console.log(response)
        if(response != null || response != ""){
          // // console.log(response);
          if(response.code == 200){
            if(this.ticketActionKey == "open"){
              this.toastr.success("Opened","Ticket "+this.ticketActionID+" is open successfully.",{timeOut:2500});
            }
            if(this.ticketActionKey == "close"){
              this.toastr.success("Closed","Ticket "+this.ticketActionID+" is closed successfully.",{timeOut:2500});
            }
            this.ticketActionMessage = null;
            this.ticketActionKey = null;
            this.ticketActionID = null;
            this.findhelpdeskTickets();
          }else if(response.code == 400){
            this.toastr.error('Unable to processed', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.toastr.error('Unable to processed', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // // console.log(response);
          this.toastr.error('Unable to processed', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        this.ngxloading = false;  
          // console.error(err);
          this.toastr.error('Unable to processed', 'Abandoned!',{timeOut:2500});
          this.pouchserv.putErrorInPouch("findhelpdesk()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );   
  }


  reopenticket(t){
    // console.log(t)
    this.ticketActionMessage = "Are you sure want to do reopen the ticket "+t.id+"?";
    this.ticketActionKey = "open";
    this.ticketActionID = t.id;
    this.modalRefAction = this.modalService.show(
      this.actiontemplate,
        Object.assign({}, this.configAction, { class: 'gray modal-sm' })
    );
  }

  closedticket(t){
    // console.log(t)
    this.ticketActionMessage = "Are you sure want to do close the ticket "+t.id+"?";
    this.ticketActionKey = "close";
    this.ticketActionID = t.id;
    this.modalRefAction = this.modalService.show(
      this.actiontemplate,
        Object.assign({}, this.configAction, { class: 'gray modal-sm' })
    );
  }

  toscroll(){
    // window.scrollTo(0,document.body.scrollHeight);
    // this.scrollToBottom(); 
  }
  scrollToBottom(): void {
      try {
          this.panelScroll.nativeElement.scrollTop = this.panelScroll.nativeElement.scrollHeight;
      } catch(err) { }                 
  }


  seedetail(t){
    // console.log(t)
    this.ticketModalData = t;
    this.modalTicketAction = this.modalService.show(
      this.ticketmodal,
        Object.assign({}, this.config, { class: 'gray modal-md' })
    );
  }

  hideme2(){
    this.modalTicketAction.hide();
  }

  exploreopen(t){
    console.log(t)
    this.chatTicketID = t.id;
    this.loadChat(t);
  }

  loadChat(t){
    this.ngxloading = true; 
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
      '_id':this.chatTicketID
    };
    // console.info(d);
    this.serv.resolveApi("get_chat_details/",d)
    .subscribe(
      res=>{
        this.ngxloading = false;  
        let response = JSON.parse(JSON.stringify(res));
        console.log(response)
        if(response != null || response != ""){
          // console.log(response);
          let arr = [];
          if(response.code == 200){
            let chat_details = response.chat_details.messages;
            if(chat_details == "" || chat_details == null){
              arr.push({
                'sendby':'user',
                'message':t.description,
                'time':t.timestamp
              });
            }else{
              arr.push({
                'sendby':'user',
                'message':t.description,
                'time':t.timestamp
              });
              let msg = chat_details;
              _.forEach(msg,(value,key)=>{
                arr.push({
                  'sendby':value.sent_by,
                  'message':value.message,
                  'time':this.convertToDate(value.timestamp)
                })
              });
            }
            this.chatTicketeMessages = arr;
            this.chatTicketPanel = 1;
            this.openChat();
            console.log(this.chatTicketeMessages)
            this.chatinterval = setInterval(()=>{
              this.loadChatIntreval(t);
            },10000);
          }else if(response.code == 400){
            this.chatTicketPanel = 0;
            this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            this.chatTicketPanel = 0;
            this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // // console.log(response);
            this.chatTicketPanel = 0;
          this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        this.loadingimage = false; 
        this.ngxloading = false; 
          // console.error(err);
            this.chatTicketPanel = 0;
          this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
          this.pouchserv.putErrorInPouch("loadChat()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
          
      }
    );  
  }

  openChat(){
    // let width = this.chatview.nativeElement.style.width;
    // if(width == "400px"){
    //   this.chatview.nativeElement.style.width = "0";
    // }else{
    //   this.chatview.nativeElement.style.width = "400px";
    // }
    this.chatview.nativeElement.style.display = "block";
  }

  closeChat(){
    // this.chatview.nativeElement.style.width = "0";
    clearInterval(this.chatinterval);
    this.chatview.nativeElement.style.display = "none";   

  }

  sendChat(){
    if(this.sendtext == "" || this.sendtext == null){
      this.toastr.warning('Message is required', null,{timeOut:2500});      
    }else{
      console.log(this.sendtext);
      let arr = this.chatTicketeMessages;
      console.log("before",this.chatTicketeMessages);


      let d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.chatTicketID,
        'message':this.sendtext
      };
      // console.info(d);
      this.serv.resolveApi("send_user_message/",d)
      .subscribe(
        res=>{
          let response = JSON.parse(JSON.stringify(res));
          // console.log(response)
          if(response != null || response != ""){
            // console.log(response);
            let arr = [];
            if(response.code == 200){
              if(response.success == true){

              }
            }else if(response.code == 400){
              this.toastr.error('Unable to send message', 'Abandoned!',{timeOut:2500});
            }else if(response.code == 401){
              this.signup.UnAuthlogoutFromApp();
            }else{
              this.toastr.error('Unable to send message', 'Abandoned!',{timeOut:2500});
            }
          }else{
            this.toastr.error('Unable to send message', 'Abandoned!',{timeOut:2500});
          }
        },
        err=>{
            this.toastr.error('Unable to send message', 'Abandoned!',{timeOut:2500});
            this.pouchserv.putErrorInPouch("sendChat()","Response error in component "+"ReferralComponent","'Moneroconnect' app the exception caught is "+JSON.stringify(err),1);
            
        }
      );  

      let t = moment().unix();
      arr.push({
        'sendby':'user',
        'message':this.sendtext,
        'time':moment.unix(t).fromNow()
      })
      this.chatTicketeMessages = arr;
      this.sendtext = "";
      console.log("after",this.chatTicketeMessages);
    }
  }

  loadChatIntreval(t){
    let d = {
      'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
      '_id':this.chatTicketID
    };
    // console.info(d);
    this.serv.resolveApi("get_chat_details/",d)
    .subscribe(
      res=>{ 
        let response = JSON.parse(JSON.stringify(res));
        console.log(response)
        if(response != null || response != ""){
          // console.log(response);
          let arr = [];
          if(response.code == 200){
            let chat_details = response.chat_details.messages;
            if(chat_details == "" || chat_details == null){
              arr.push({
                'sendby':'user',
                'message':t.description,
                'time':t.timestamp
              });
            }else{
              arr.push({
                'sendby':'user',
                'message':t.description,
                'time':t.timestamp
              });
              let msg = chat_details;
              _.forEach(msg,(value,key)=>{
                arr.push({
                  'sendby':value.sent_by,
                  'message':value.message,
                  'time':this.convertToDate(value.timestamp)
                })
              });
            }
            this.chatTicketeMessages = arr;
            console.log(this.chatTicketeMessages)
          }else if(response.code == 400){
            // this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
          }else if(response.code == 401){
            this.signup.UnAuthlogoutFromApp();
          }else{
            // this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
          }
        }else{
          // // console.log(response);
          //   this.chatTicketPanel = 0;
          // this.toastr.error('Unable to find support messages', 'Abandoned!',{timeOut:2500});
        }
      },
      err=>{
        // this.ngxloading = false; 
          // console.error(err);
      }
    );  
  }

}
