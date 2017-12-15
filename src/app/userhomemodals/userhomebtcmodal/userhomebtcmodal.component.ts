import { Component, OnInit, TemplateRef, ViewChild,Input,Output,EventEmitter, ElementRef, Host } from '@angular/core';

import { ServiceapiService } from '../../services/serviceapi.service';
import { SignupService } from '../../services/signup.service';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params

import { AngularFireDatabase,AngularFireList,AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserhomeComponent } from '../../userhome/userhome.component';

import { FbapiService } from '../../services/fbapi.service';
import { PouchService } from '../../services/pouch.service';
@Component({
  selector: 'app-userhomebtcmodal',
  templateUrl: './userhomebtcmodal.component.html',
  styleUrls: ['./userhomebtcmodal.component.css'],
  providers:[ServiceapiService,SignupService,PouchService]
})
export class UserhomebtcmodalComponent implements OnInit {
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  }; 
  public qrvalue:any;
  // @Input()
  // homeprop: number = 1;
  @Output() homeprop: EventEmitter<any> = new EventEmitter();
  stepRecieveBTH:number;//0 for first erc20 form ,1 for refund address, 2 for calc submit ,3 for firebase confirm,4 for congtrats
  //param for btc payment
  btcmodaltitle:string = "Pay through BTC";
  btcwalletname:string;
  btcwalletaddress:any;
  btcrefundaddress:any;
  toBTC:number=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
  toBTCRefund:number;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
  //toBTCConfirm:number = 0;//screen 3 for final submit

  loadingimage:boolean = false;

  generated_address:any;
  currency:any;
  amount_to_pay:any;
  token_amount:any;
  showtransidin3:any;


  //fb params
  user: Observable<firebase.User>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>; //  list of objects
  initialCount:any = 0;
  progresstype:any="danger";
  progressvalue:number=0;
  progressshow:boolean = false;
  fbinterval:any;
  //fb params

  message:any;message1:any;

  @ViewChild("btcmodal") btcmodal:Element;

  bitcoinurl:any = "https://blockchain.info/tx";//https://blockchain.info/tx/5d832e96383a1e8ff741d27b4878e929647425a8713d2410764fdb2132afead5
 
  starterDisableButton:boolean = false;

  constructor(
    public afAuth: AngularFireAuth, 
    public af: AngularFireDatabase,
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService, 
    public signup:SignupService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private element:ElementRef,
    private fbapi:FbapiService,
    public pouchserv:PouchService
  ) { 
      this.user = afAuth.authState;
      this.itemsRef = af.list('/transaction_details');

      this.qrvalue = "Its Demo For QR Angular";

      //console.log(this.element.nativeElement.parentElement);

      //starterDisableButton disabled
      // let dis = this.storage.retrieve("MoneroAUXstarterSecretButton");
      // if(dis == "yes")
        this.starterDisableButton = false;
      // else 
      //   this.starterDisableButton = false;
  }

  ngOnInit() {
    // console.log(this.element)
    // console.log(this.route)
    // console.log(this.router)
    //BTC
    this.stepRecieveBTH = 1;
    this.toBTC = 0;//if user not submitted wallet address and wallet name
      //screen1
    let btcwn = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWN");//wallet name
    let btcwa = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWA");//wallet address
    //console.log(btcwa,btcwn)
    if((btcwa == "" || btcwa == null || btcwa == undefined || !btcwa) && (btcwn == "" || btcwn == undefined || btcwn == null || !btcwn)){
      this.toBTC = 0;//show submitnextskip btn
    }else{
      this.toBTC = 1;//show review and submit btn
      this.btcwalletname = btcwn;
      this.btcwalletaddress = btcwa;
    }
      //screen2
    let btcra = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionRA");//refund address
    if((btcra == "" || btcra == null || !btcra)){
      this.toBTCRefund = 0;//show submitnextskip btn
    }else{
      this.toBTCRefund = 1;//show review and submit btn
      this.btcrefundaddress = btcra;
    }
      //screen3 not used
    // let btcdone = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionDone");//refund address
    // if((btcdone == false || btcdone == "" || btcdone == null || !btcdone)){
    //   this.toBTCConfirm = 0;//show confirm btn
    // }else if(btcdone == true || btcdone == "done"){
    //   this.toBTCConfirm = 1;//show waiting btn
    // }
  }

  loggedInFBauth(){
    let email = this.signup.retrieveFromLocal("MoneroAUXUserEmail");
    let password = "tokenbazaar";
    // console.log("fb,",email,password);
    this.fbapi.login(email,password);
  }

  loggedOutFBauth(){
    this.fbapi.logout();
  }

  //modal functionality
  hideme(){
    //this.storage.clear("MoneroAUXsavelocalpaytype");
    //this.storage.clear("MoneroAUXsavelocalamount");
    this.clearERC();
    this.modalRef.hide();
  }
  open_recieve_modal(modalBTC: TemplateRef<any>){
    //console.log(this.cas)
    //console.log(this.optradio)
    // let dis = this.storage.retrieve("MoneroAUXstarterSecretButton");
    // if(dis == "no") return true;
      
    
    let type =this.signup.retrieveFromLocal("MoneroAUXsavelocalpaytype");
    let cash = this.signup.retrieveFromLocal("MoneroAUXsavelocalamount");
    //console.log(type,cash)
    if(cash == undefined || cash == "" || cash == null){
      this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2000});
    }else if(type == undefined || type == "" || type == null){
      this.toastr.error('Choose any one payment method!', 'Not a payment type',{timeOut:2000});
    }else{ 
      this.loadingimage = true;
      let d = {
        'email':this.signup.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.signup.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'token_amount':cash
      };
      //console.log(d)
      this.serv.resolveApi("validate_token_amount",d)
      .subscribe(
        res=>{
          //console.log(res,d);
          
          let response = JSON.parse(JSON.stringify(res));
          if(response != null || response != ""){
            if(response.valid == true){
                if(type == "btc"){
                  this.serv.saveToLocal("MoneroAUXBTCTransaction_token_amount",cash);
                  this.callforpaywithcurrencyonmodaltoshow("btc",cash,modalBTC);
                }else{
                  this.loadingimage = false;
                  this.toastr.error('Choose any one payment method!', 'Not a payment type',{timeOut:2000});
                }
            }else{
              this.loadingimage = false;
              this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});  
            }
          }else{
            this.loadingimage = false;
            this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});  
          }
        },
        err=>{
          this.loadingimage = false;
          //console.error(err);
          this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});
          this.pouchserv.putErrorInPouch("open_receive_modal()","Response error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
          
        }
      );

      
    }
  }  
  callforpaywithcurrencyonmodaltoshow(type,amount,modalBTC){
    let d = {
      email:this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      token:this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      currency:type,//('eth','btc','fiat'),
      token_amount:amount
    }
    //console.log(d)
    // this.modalRef = this.modalService.show(
    //     modalBTC,
    //     Object.assign({}, this.config, { class: 'gray modal-md' })
    // );
    this.serv.resolveApi("pay_with_currency/",d)
    .subscribe(
      (res)=>{
        console.log(res);
        let response = JSON.parse(JSON.stringify(res));
        if(response.code == 200){
          let to_address = response.to_address;
          let _id = response._id;
          let erc_address = response.erc_address;
          let erc_wallet = response.erc_wallet;
          this.loadingimage = false;
          if(type == "btc"){
            this.serv.saveToLocal("MoneroAUXBTCTransaction_id",_id);
            this.serv.saveToLocal("MoneroAUXBTCTransaction_to_address",to_address);
            if(erc_address != "" || erc_address != null || erc_wallet != "" || erc_wallet != null){
              this.serv.saveToLocal("MoneroAUXBTCTransactionWN",erc_wallet);
              this.serv.saveToLocal("MoneroAUXBTCTransactionWA",erc_address);
            }
            this.modalRef = this.modalService.show(
                modalBTC,
                Object.assign({}, this.config, { class: 'gray modal-md' })
            );
            this.loggedInFBauth();
            if(response.refund_address != null){
              this.btcrefundaddress = response.refund_address;
              let f =  response.amount_to_pay;
              this.amount_to_pay = this.roundUp(f, 1000000);// response.amount_to_pay;
            }else{
              this.btcrefundaddress = response.refund_address;
              let f =  response.amount_to_pay;
              this.amount_to_pay = this.roundUp(f, 1000000);// response.amount_to_pay;
            }
            this.stepRecieveBTH = 1;this.btcmodaltitle = "Pay through BTC";
 

            //this.childModal.show();
          }else{
            this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});
          }
        }else{
          this.loadingimage = false;
          this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});
        }
      },
      (err)=>{
        //console.error(err);
        this.loadingimage = false;
        this.toastr.error('Minimum $20 worth of XMRC Coin can be bought. Please enter a higher amount.', null,{timeOut:2500});
        this.pouchserv.putErrorInPouch("callforpaywithcurrencyonmodaltoshow()","Response error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }
  //modal functionality


  /****
   * BTC Payment
   */
  //Screen1 Not required for XMRCcryp
  doTheseIfChangeDetectInBTC(val){
    //console.log(this.btcwalletaddress,this.btcwalletname);//console.log(val.target.value);
    if(this.toBTC == 1 || this.toBTC == 2){
      let btcwn = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWN");//wallet name
      let btcwa = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWA");//wallet address
      if(btcwa == val.target.value || btcwn == val.target.value){ 
        this.toBTC = 1;//stay with review and submit btn
        //console.log("Im not changed");
      }else{ 
        this.toBTC = 2;//show update and submit
      }
    }
  }
  btcwalletnamechange(val){//change wallet name from screen 1
    this.doTheseIfChangeDetectInBTC(val);
  }
  btcwalletaddresschange(val){
    this.doTheseIfChangeDetectInBTC(val);
  }
  nextbtc1_1(){//if not store wallet name and wallet address
    if(this.btcwalletname == "" || this.btcwalletname == null || this.btcwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.btcwalletaddress == "" || this.btcwalletaddress == null || this.btcwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBTCTransactionWN",this.btcwalletname);
      this.serv.saveToLocal("MoneroAUXBTCTransactionWA",this.btcwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'erc_address':this.btcwalletaddress,
        'eth_wallet':this.btcwalletname
      };//console.log(data);
      this.callingApiForBTCScreen2("create_erc_address",data);
    }
  } 
  nextbtc1_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("MoneroAUXBTCTransactionWN",this.btcwalletname);
    this.serv.saveToLocal("MoneroAUXBTCTransactionWA",this.btcwalletaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      '_id':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id"),
      'currency':'btc'
    };//console.log(data);
    this.callingApiForBTCScreen2("review_erc_address",data);
  } 
  nextbtc1_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.btcwalletname == "" || this.btcwalletname == null || this.btcwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.btcwalletaddress == "" || this.btcwalletaddress == null || this.btcwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBTCTransactionWN",this.btcwalletname);
      this.serv.saveToLocal("MoneroAUXBTCTransactionWA",this.btcwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id"),
        'currency':'btc',
        'new_erc_address':this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWA"),
        'new_erc_wallet':this.serv.retrieveFromLocal("MoneroAUXBTCTransactionWN")
      };//console.log(data);
      this.callingApiForBTCScreen2("update_erc_address",data);
    }
  } 
  callingApiForBTCScreen2(walletfor,data){//call web api for create_erc_address ***********web
    // console.log(walletfor,this.btcwalletaddress,this.btcwalletname,data)
    this.loadingimage = true;
     
    this.serv.resolveApi(walletfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        // console.log(response);
        if(response.success == true || response.code == 200){
           if(response.refund_address != null){
             this.btcrefundaddress = response.refund_address;
             this.amount_to_pay = response.amount_to_pay;
           }
           this.stepRecieveBTH = 1;this.btcmodaltitle = "Pay through BTC";

           //test
          //  this.toastr.warning('Test', 'Test',{timeOut:5000});
          //  setTimeout(()=>{
          //   this.stepRecieveBTH = 0;
          //  },5000);
        }else{
          this.toastr.error('Please check and retry.', 'Invalid Bitcoin Address!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Please check and retry.', 'Invalid Bitcoin Address!');
        this.pouchserv.putErrorInPouch("callingApiForBTCScreen2()","Response error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }






  //Screen2 started here forXMRCcryp
  btcrefundaddresschange(val){
    if(this.toBTCRefund == 1 || this.toBTCRefund == 2){
      let btcra = this.serv.retrieveFromLocal("MoneroAUXBTCTransactionRA");//refund address
      if(btcra == val.target.value){ 
        this.toBTCRefund = 1;//stay with review and submit btn
      }else{ 
        this.toBTCRefund = 2;//show update and submit
      } 
    }
  }
  nextbtc2_1(){//submit final modal 3 screen
    if(this.btcrefundaddress == "" || this.btcrefundaddress == null || this.btcrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBTCTransactionRA",this.btcrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id"),
        'currency':'btc',
        'token_amount':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_token_amount"),
        'new_refund_address':this.btcrefundaddress
      };
      this.callingApiForBTCScreen3("update_refund_address",data);
    }
  } 
  nextbtc2_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("MoneroAUXBTCTransactionRA",this.btcrefundaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
      '_id':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id"),
      'currency':'btc',
      'token_amount':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_token_amount")
    };
    this.callingApiForBTCScreen3("review_refund_address",data);
  } 
  nextbtc2_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.btcrefundaddress == "" || this.btcrefundaddress == null || this.btcrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBTCTransactionRA",this.btcrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id"),
        'currency':'btc',
        'token_amount':this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_token_amount"),
        'new_refund_address':this.btcrefundaddress
      };
      this.callingApiForBTCScreen3("update_refund_address",data);
    }
  } 
  callingApiForBTCScreen3(reviewfor,data){//call web api for refund  ***********web
    //console.log(this.btcwalletaddress,this.btcwalletname)
    this.serv.saveToLocal("MoneroAUXBTCTransactionWN",this.btcwalletname);
    this.serv.saveToLocal("MoneroAUXBTCTransactionWA",this.btcwalletaddress);
    this.loadingimage = true;
    //console.log(data)
    this.serv.resolveApi(reviewfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        //console.log(response);
        if(response.success == true || response.code == 200){
          this.generated_address = response.generated_address;
          this.currency = response.currency;
          this.token_amount = response.token_amount;
          //this.amount_to_pay = response.amount_to_pay;
          this.qrvalue = this.generated_address;
          this.stepRecieveBTH = 2;this.btcmodaltitle = "Pay through BTC";//next firebase
          setTimeout(()=>{
            this.callfb();
          },5000);
        }else{
            this.toastr.error('Please check and retry.', 'Invalid Bitcoin Address!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Please check and retry.', 'Invalid Bitcoin Address!');
        this.pouchserv.putErrorInPouch("callingApiForBTCScreen3()","Response error in component "+this.constructor.name,"'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }

  //calling firebase response
  callfb(){ 
    // this.showtransidin3 = this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id");
    // this.stepRecieveBTH = 3;this.btcmodaltitle = "Pay through BTC (Transfer Confirmation)";//next firebase
    //console.log("calling fb");
    this.fbinterval = setInterval(()=>{
      //console.log('interval started');
      this.items = this.gettransaction_details();
    },2000);
  }

  //call fb **************************************************************************
  gettransaction_details(){
    let useremail = this.signup.retrieveFromLocal("MoneroAUXUserEmail");
    let useraddress = this.signup.retrieveFromLocal("MoneroAUXBTCTransaction_to_address");
    //console.log(useraddress,useremail)
    let ar = [];
    return this.itemsRef.snapshotChanges().map(arr => {
      console.log(arr)
      if(arr.length>0){
        
        let key;let val;
        ar = [];
        arr.forEach(
          d=>{
            let secretaddress = d.key;
            let to_address = useraddress;
            if(secretaddress == to_address){
              if(this.fbinterval){
                clearInterval(this.fbinterval);
                // console.log("interval stopped...")
              }
              let check_address = d.payload.val().to_address;
              let email = d.payload.val().email_id;
              let currency = d.payload.val().currency;
              if(email == useremail && currency == 'btc' && useraddress == check_address){// 
                key = d.key;
                val = d.payload.val();
                this.showtransidin3 = d.payload.val().txid;
                ar.push(d);
                this.initialCount = d.payload.val().confirmations;
                //console.log(key,d.payload.val())
              }

            }
          }
        )
        // console.log(key,val,val.confirmations);
        if(this.initialCount == 0 || val.confirmations == 0){
          this.progresstype = "danger";
          this.progressvalue = 0;
          this.showtransidin3 = val.txid;//this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id");
          this.stepRecieveBTH = 3;this.btcmodaltitle = "Pay through BTC";//next firebase
        }
        if(this.initialCount == 1 || val.confirmations == 1){
          this.progresstype = "warning";
          this.progressvalue = 50;
        }
        if(this.initialCount == 2 || val.confirmations == 2){
          this.progresstype = "info";
          this.progressvalue = 100;
        }
        if(val.confirmations >= 3){
          this.progresstype = "success";
          this.progressvalue = 150;
          setTimeout(()=>{
            this.progressshow = true;},1000);//hide progressbar
          setTimeout(()=>{
            this.callToopen(val);
          },2500);
          //confirmation toastr
        }
        return ar.map(snap => Object.assign(
          snap.payload.val(), { $key: snap.key }) 
        );
      }
    })
  }
  callToopen(val){
   // console.log(val,"imcalled");
    this.dothese();
  }
  //call fb **************************************************************************


  submitBTC(){//not used
    //this.toBTCConfirm = 1;
  }
  submitDoneBTC(){//not used
    this.stepRecieveBTH = 3;//showing congrats screen if payment has done
    this.btcmodaltitle = "Waiting for payment confirmation";
    setTimeout(()=>{this.dothese();},5000);
  }

  //for screen4
  dothese(){
    this.btcmodaltitle = "Congratulations";
    //this.toastr.success('BTC transaction is done successfully', 'Transaction completed');
    this.stepRecieveBTH = 4;
    this.signup.saveToLocal("MoneroAUXPageChange","yes");
    let cas = this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_token_amount");
    let transaction_id = this.serv.retrieveFromLocal("MoneroAUXBTCTransaction_id");
    this.message1 = cas;
    this.message = this.showtransidin3;
    setTimeout(()=>{  
      // this.hideme();
      clearInterval(this.fbinterval);
      this.storage.clear("MoneroAUXBTCTransactionRA");
      this.storage.clear("MoneroAUXBTCTransactionWA");
      this.storage.clear("MoneroAUXBTCTransactionWN");
      this.storage.clear("MoneroAUXBTCTransaction_id");
      this.storage.clear("MoneroAUXBTCTransaction_to_address");
      this.storage.clear("MoneroAUXBTCTransaction_token_amount");
      // this.stepRecieveBTH = 1;
      // this.btcmodaltitle = "Pay through BTC";
      this.btcwalletname = "";
      this.btcwalletaddress="";
      this.btcrefundaddress="";
      this.toBTC=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
      this.toBTCRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
      //this.toBTCConfirm= 0;
      this.progresstype = "danger";
      this.progressvalue = 0;
      this.progressshow = false;
      this.initialCount = 0;
      // this.toastr.info('Wait for admin mail that verify transaction.', 'Note:',{timeOut:8000});
      // this.toastr.info('You can make new transaction.', 'Make another transaction',{timeOut:3000});
      
    },5000);
  }
  /**
   * BTC END
   */


  clearERC(){
    clearInterval(this.fbinterval);
    this.loggedOutFBauth();
    this.storage.clear("MoneroAUXBTCTransactionRA");
    this.storage.clear("MoneroAUXBTCTransactionWA");
    this.storage.clear("MoneroAUXBTCTransactionWN");
    this.storage.clear("MoneroAUXBTCTransaction_id");
    this.storage.clear("MoneroAUXBTCTransaction_to_address");
    this.storage.clear("MoneroAUXBTCTransaction_token_amount");
    this.stepRecieveBTH = 1;
    this.btcmodaltitle = "Pay through BTC (ERC20 Token)";
    this.btcwalletname = "";
    this.btcwalletaddress="";
    this.btcrefundaddress="";
    this.toBTC=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
    this.toBTCRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
    //this.toBTCConfirm= 0;
    this.progresstype = "danger";
    this.progressvalue = 0;
    this.progressshow = false;
    this.initialCount = 0;
    this.message = "";this.message1 = "";
    this.showtransidin3 = '';
    if(this.stepRecieveBTH == 1){
      location.reload();
    }
  }

  roundUp(num, precision) {
    return Math.ceil(num * precision) / precision
  }

  copytext(btcaddress){
    this.toastr.info(null, 'Address copied to your clipboard.',{timeOut:1500});
  }
}
