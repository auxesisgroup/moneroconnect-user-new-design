import { Component, OnInit, ElementRef, TemplateRef } from '@angular/core';

import { ServiceapiService } from '../../services/serviceapi.service';
import { SignupService } from '../../services/signup.service';
import { PouchService } from '../../services/pouch.service';

import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { ToastrService } from 'ngx-toastr';

// import * as jQuery from 'jquery';

// declare const jQuery:any; 

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AngularFireDatabase,AngularFireList,AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

import { FbapiService } from '../../services/fbapi.service';
import { ActivityService } from '../../services/activity.service';
import { WalletsService } from '../../services/wallets.service';
@Component({
  selector: 'app-userhomeethmodal',
  templateUrl: './userhomeethmodal.component.html',
  styleUrls: ['./userhomeethmodal.component.css'],
  providers:[ServiceapiService,SignupService,PouchService,ActivityService,WalletsService]
})
export class UserhomeethmodalComponent implements OnInit {
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  }; 
  public qrvalue:any;

  stepRecieveETH:number;//0 for first erc20 form ,1 for refund address, 2 for calc submit ,3 for firebase confirm,4 for congtrats
  //param for eth payment
  ethmodaltitle:string = "Pay through ETH";
  ethwalletname:string = "0";
  ethwalletaddress:any;
  ethrefundaddress:any;
  toETH:number=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
  toETHRefund:number;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
  //toETHConfirm:number = 0;//screen 3 for final submit

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

  etherurl:any = "https://etherscan.io/tx";//https://etherscan.io/tx/0xb541ca450c1d7079eaca54ffb8a70164cf49e8e818f80a7c41e4400c8f6956a9
  
  starterDisableButton:boolean = false;

  walletbinder:any = [];
  selectWalletError:boolean = false;

  constructor(
    public afAuth: AngularFireAuth, 
    public af: AngularFireDatabase,
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService,
    public signup:SignupService,
    public elRef:ElementRef,
    private modalService: BsModalService,
    private fbapi:FbapiService,
    public pouchserv:PouchService,
    public activityServ:ActivityService,
    public ws:WalletsService
  ) { 
    this.user = afAuth.authState;
    this.itemsRef = af.list('/transaction_details');

    this.qrvalue = "Its Demo For QR Angular";
    //console.log(this.elRef.nativeElement.parentElement)

    //starterDisableButton disabled
    // let dis = this.storage.retrieve("MoneroAUXstarterSecretButton");
    // if(dis == "yes")
      this.starterDisableButton = false;
      this.loadWLTf();
    // else 
    //   this.starterDisableButton = false;
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

  ngOnInit() {
    //ETH
    this.stepRecieveETH = 1;
    this.toETH = 0;//if user not submitted wallet address and wallet name
      //screen1
    let ethwn = this.serv.retrieveFromLocal("MoneroAUXETHTransactionWN");//wallet name
    let ethwa = this.serv.retrieveFromLocal("MoneroAUXETHTransactionWA");//wallet address
    //console.log(ethwa,ethwn)
    if((ethwa == "" || ethwa == null || ethwa == undefined || !ethwa) && (ethwn == "" || ethwn == undefined || ethwn == null || !ethwn)){
      this.toETH = 0;//show submitnextskip btn
      this.ethwalletname = "0";
      this.ethwalletaddress = "";
    }else{
      this.toETH = 1;//show review and submit btn
      this.ethwalletname = ethwn;
      this.ethwalletaddress = ethwa;
    }
      //screen2
    let ethra = this.serv.retrieveFromLocal("MoneroAUXETHTransactionRA");//refund address
    if((ethra == "" || ethra == null || !ethra)){
      this.toETHRefund = 0;//show submitnextskip btn
    }else{
      this.toETHRefund = 1;//show review and submit btn
      this.ethrefundaddress = ethra;
    }
      //screen3 not used
    // let ethdone = this.serv.retrieveFromLocal("MoneroAUXETHTransactionDone");//refund address
    // if((ethdone == false || ethdone == "" || ethdone == null || !ethdone)){
    //   this.toETHConfirm = 0;//show confirm btn
    // }else if(ethdone == true || ethdone == "done"){
    //   this.toETHConfirm = 1;//show waiting btn
    // }
  }

  loadWLTf(){
    let wlt = this.ws.loadWallets();
    // console.log(wlt)
    this.walletbinder = wlt;
  }

  loadPaymentOptions(){
    
  }

  /**
   * Modal
   */
  hideme(){
    //this.storage.clear("MoneroAUXsavelocalpaytype");
    //this.storage.clear("MoneroAUXsavelocalamount");
    this.clearERC();
    this.modalRef.hide();
  }
  open_recieve_modal(modalETH: TemplateRef<any>){
    //console.log(this.cas)
    //console.log(this.optradio)
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
              if(type == "eth"){
                this.serv.saveToLocal("MoneroAUXETHTransaction_token_amount",cash);
                this.callforpaywithcurrencyonmodaltoshow("eth",cash,modalETH);
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
          this.pouchserv.putErrorInPouch("open_receive_modal()","Response error in component "+"UserhomeethmodalComponent","'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
          
        }
      );

      
    }
  }  
  callforpaywithcurrencyonmodaltoshow(type,amount,modalETH){
    let d = {
      email:this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      token:this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      currency:type,//('eth','btc','fiat'),
      token_amount:amount
    }
    //console.log(d)
    this.serv.resolveApi("pay_with_currency/",d)
    .subscribe(
      (res)=>{
        //console.log(res);
        let response = JSON.parse(JSON.stringify(res));
        if(response.code == 200){
          let to_address = response.to_address;
          let _id = response._id;
          let erc_address = response.erc_address;
          let erc_wallet = response.erc_wallet;
          this.loadingimage = false;
          if(type == "eth"){
            this.serv.saveToLocal("MoneroAUXETHTransaction_id",_id);
            this.serv.saveToLocal("MoneroAUXETHTransaction_to_address",to_address);
            if(erc_address == "" || erc_address == null || erc_wallet == "" || erc_wallet == null){
              this.toETH = 0;
              this.ethwalletname = "0";
              this.ethwalletaddress = "";
            }else{
              this.serv.saveToLocal("MoneroAUXETHTransactionWN",erc_wallet);
              this.serv.saveToLocal("MoneroAUXETHTransactionWA",erc_address);
              this.toETH = 1;//show review and submit btn
              this.ethwalletname = erc_wallet;
              this.ethwalletaddress = erc_address;
              let wvalue = this.ethwalletname;
              let wbindr = this.ws.loadWalletFilter(wvalue);
              if(wbindr == "incompatible"){
                this.selectWalletError = true;
              }else{
                this.selectWalletError = false;
              }
            }
            this.modalRef = this.modalService.show(
              modalETH,
              Object.assign({}, this.config, { class: 'gray modal-md' })
            );
            this.loggedInFBauth();            
            this.activityServ.putActivityInPouch("UserhomeethmodalComponent","callforpaywithcurrencyonmodaltoshow()","Modal open for eth transaction","");            
            
            if(response.refund_address != null){
              this.ethrefundaddress = response.refund_address;
              let f =  response.amount_to_pay;
              this.amount_to_pay = this.roundUp(f, 1000000);// response.amount_to_pay;
            }else{
              this.ethrefundaddress = response.refund_address;
              let f =  response.amount_to_pay;
              this.amount_to_pay = this.roundUp(f, 1000000);// response.amount_to_pay;
            }
             this.stepRecieveETH = 0;this.ethmodaltitle = "Pay through ETH";
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
        this.pouchserv.putErrorInPouch("callforpaywithcurrencyonmodaltoshow()","Response error in component "+"UserhomeethmodalComponent","'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }  
  //Modal


  /****
   * ETH Payment
   */
  //Screen1 required for XMRCcryp
  doTheseIfChangeDetectInETH(val){
    let wvalue = this.ethwalletname;
    
    let wbindr = this.ws.loadWalletFilter(wvalue);
    // console.log(wbindr)
    if(wbindr == "incompatible"){
      this.selectWalletError = true;
    }else{
      this.selectWalletError = false;
    }
    //console.log(this.ethwalletaddress,this.ethwalletname);//console.log(val.target.value);
    if(this.toETH == 1 || this.toETH == 2){
      let ethwn = this.serv.retrieveFromLocal("MoneroAUXETHTransactionWN");//wallet name
      let ethwa = this.serv.retrieveFromLocal("MoneroAUXETHTransactionWA");//wallet address
      if(ethwa == val.target.value || ethwn == val.target.value){ 
        this.toETH = 1;//stay with review and submit btn
        //console.log("Im not changed");
      }else{ 
        this.toETH = 2;//show update and submit
      }
    }
  }
  ethwalletnamechange(val){//change wallet name from screen 1
    this.doTheseIfChangeDetectInETH(val);
  }
  ethwalletaddresschange(val){
    this.doTheseIfChangeDetectInETH(val);
  }
  nexteth1_1(){//if not store wallet name and wallet address
    if(this.ethwalletname == "" || this.ethwalletname == null || this.ethwalletname == undefined){
      this.toastr.warning('Wallet name is required', null);
    }else if(this.ethwalletaddress == "" || this.ethwalletaddress == null || this.ethwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', null);
    }else{
      this.serv.saveToLocal("MoneroAUXETHTransactionWN",this.ethwalletname);
      this.serv.saveToLocal("MoneroAUXETHTransactionWA",this.ethwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'erc_address':this.ethwalletaddress,
        'eth_wallet':this.ethwalletname
      };//console.log(data);
      this.callingApiForETHScreen2("create_erc_address",data);
    }
  } 
  nexteth1_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("MoneroAUXETHTransactionWN",this.ethwalletname);
    this.serv.saveToLocal("MoneroAUXETHTransactionWA",this.ethwalletaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      '_id':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id"),
      'currency':'eth'
    };//console.log(data);
    this.callingApiForETHScreen2("review_erc_address",data);
  } 
  nexteth1_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.ethwalletname == "" || this.ethwalletname == null || this.ethwalletname == undefined){
      this.toastr.warning('Wallet name is required', null);
    }else if(this.ethwalletaddress == "" || this.ethwalletaddress == null || this.ethwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', null);
    }else{
      this.serv.saveToLocal("MoneroAUXETHTransactionWN",this.ethwalletname);
      this.serv.saveToLocal("MoneroAUXETHTransactionWA",this.ethwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id"),
        'currency':'eth',
        'new_erc_address':this.serv.retrieveFromLocal("MoneroAUXETHTransactionWA"),
        'new_erc_wallet':this.serv.retrieveFromLocal("MoneroAUXETHTransactionWN")
      };//console.log(data);
      this.callingApiForETHScreen2("update_erc_address",data);
    }
  } 
  callingApiForETHScreen2(walletfor,data){//call web api for                ***********web
    this.loadingimage = true;
    
    this.serv.resolveApi(walletfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));
        // console.log(response);
        if(response.success == true || response.code == 200){
          if(response.refund_address != null){
            this.ethrefundaddress = response.refund_address;
          }
           this.stepRecieveETH = 1;this.ethmodaltitle = "Pay through ETH";
           this.activityServ.putActivityInPouch("UserhomeethmodalComponent","callingApiForETHScreen2()","Modal open for eth transaction with screen 1","");            
           
        }else{
          this.toastr.error('Please check and retry.', 'Invalid Ether Address!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Please check and retry.', 'Invalid Ether Address!');
        this.pouchserv.putErrorInPouch("callingApiForETHScreen2()","Response error in component "+"UserhomeethmodalComponent","'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }

  //Screen2 started here for XMRCcryp
  ethrefundaddresschange(val){
    if(this.toETHRefund == 1 || this.toETHRefund == 2){
      let ethra = this.serv.retrieveFromLocal("MoneroAUXETHTransactionRA");//refund address
      if(ethra == val.target.value){ 
        this.toETHRefund = 1;//stay with review and submit btn
      }else{ 
        this.toETHRefund = 2;//show update and submit
      } 
    }
  }
  nexteth2_1(){//submit final modal 3 screen
    if(this.ethrefundaddress == "" || this.ethrefundaddress == null || this.ethrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXETHTransactionRA",this.ethrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id"),
        'currency':'eth',
        'token_amount':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_token_amount"),
        'new_refund_address':this.ethrefundaddress
      };
      this.callingApiForETHScreen3("update_refund_address",data);
    }
  } 
  nexteth2_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("MoneroAUXETHTransactionRA",this.ethrefundaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
      '_id':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id"),
      'currency':'eth',
      'token_amount':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_token_amount"),
    };
    this.callingApiForETHScreen3("review_refund_address",data);
  } 
  nexteth2_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.ethrefundaddress == "" || this.ethrefundaddress == null || this.ethrefundaddress == undefined){
      this.toastr.warning('Refund address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXETHTransactionRA",this.ethrefundaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),  
        '_id':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id"),
        'currency':'eth',
        'token_amount':this.serv.retrieveFromLocal("MoneroAUXETHTransaction_token_amount"),
        'new_refund_address':this.ethrefundaddress
      };
      this.callingApiForETHScreen3("update_refund_address",data);
    }
  } 
  callingApiForETHScreen3(reviewfor,data){//call web api for refund  ***********web
    this.serv.saveToLocal("MoneroAUXETHTransactionWN",this.ethwalletname);
    this.serv.saveToLocal("MoneroAUXETHTransactionWA",this.ethwalletaddress);
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
          // this.amount_to_pay = response.amount_to_pay;
          this.qrvalue = this.generated_address;
          this.stepRecieveETH = 2;this.ethmodaltitle = "Pay through ETH";//next firebase

          this.activityServ.putActivityInPouch("UserhomeethmodalComponent","callingApiForETHScreen3()","Screen 2 open","Start here firebase service");            
          
          this.loggedInFBauth();

          setTimeout(()=>{
            this.callfb();
          },5000);
        }else{
          this.toastr.error('Please check and retry.', 'Invalid Ether Address!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Please check and retry.', 'Invalid Ether Address!');
        this.pouchserv.putErrorInPouch("callingApiForETHScreen3()","Response error in component "+"UserhomeethmodalComponent","'Monerocryp' app the exception caught is "+JSON.stringify(err),2);
        
      }
    );
  }

  //calling firebase response
  callfb(){
    // this.showtransidin3 = this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id");
    // this.stepRecieveETH = 3;this.ethmodaltitle = "Pay through ETH (Transfer Confirmation)";//next firebase
    //console.log("calling fb");
    this.fbinterval = "";
    this.fbinterval = setInterval(()=>{
      // console.log('interval started');
      this.items = this.gettransaction_details();
    },2000);
  }

  //call fb **************************************************************************
  gettransaction_details(){
    let useremail = this.signup.retrieveFromLocal("MoneroAUXUserEmail");
    let useraddress = this.signup.retrieveFromLocal("MoneroAUXETHTransaction_to_address");
    //console.log(useraddress,useremail)
    let ar = [];
    return this.itemsRef.snapshotChanges().map(arr => {
      // console.log(arr)
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
                //console.log("interval stopped...")
              }
              let check_address = d.payload.val().to_address;
              let email = d.payload.val().email_id;
              let currency = d.payload.val().currency;
              if(email == useremail && currency == 'eth'  && useraddress == check_address){
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
          this.showtransidin3 = val.txid;//this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id");
          this.stepRecieveETH = 3;this.ethmodaltitle = "Pay through ETH";//next firebase
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
    //console.log(val,"imcalled");
    this.dothese();
  }
  //call fb **************************************************************************

  submitETH(){//not used
    //this.toETHConfirm = 1;
  }
  submitDoneETH(){//not used
    this.stepRecieveETH = 3;//showing congrats screen if payment has done
    this.ethmodaltitle = "Waiting for payment confirmation";
    setTimeout(()=>{this.dothese();},5000);
  }

  //for screen4
  dothese(){
    this.ethmodaltitle = "Congratulations";
    //this.toastr.success('ETH transaction is done successfully', 'Transaction completed');
    this.stepRecieveETH = 4;
    this.signup.saveToLocal("MoneroAUXPageChange","yes");
    let cas = this.serv.retrieveFromLocal("MoneroAUXETHTransaction_token_amount");
    let transaction_id = this.serv.retrieveFromLocal("MoneroAUXETHTransaction_id");
    this.message1 = cas;
    this.message = this.showtransidin3;//cas+" XMRC Token from transaction id "+this.showtransidin3+"  is deposited in your account.";
    setTimeout(()=>{  
      // this.hideme();
      clearInterval(this.fbinterval);
      this.storage.clear("MoneroAUXETHTransactionRA");
      this.storage.clear("MoneroAUXETHTransactionWA");
      this.storage.clear("MoneroAUXETHTransactionWN");
      this.storage.clear("MoneroAUXETHTransaction_id");
      this.storage.clear("MoneroAUXETHTransaction_to_address");
      this.storage.clear("MoneroAUXETHTransaction_token_amount");
      // this.stepRecieveETH = 1;
      // this.ethmodaltitle = "Pay through ETH";
      this.ethwalletname = "0";
      this.ethwalletaddress="";
      this.ethrefundaddress="";
      this.toETH=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
      this.toETHRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
      //this.toETHConfirm= 0;
      this.progresstype = "danger";
      this.progressvalue = 0;
      this.progressshow = false;
      this.initialCount = 0;
      // this.toastr.info('Wait for admin mail that verify transaction.', 'Note:',{timeOut:8000});
      // this.toastr.info('You can make new transaction.', 'Make another transaction',{timeOut:3000});
      // setTimeout(()=>{location.reload();},3100);
      this.activityServ.putActivityInPouch("UserhomebtcmodalComponent","dothese()","Modal closed for btc transaction","");                
      
    },5000);
  }
  /**
   * ETH END
   */


  clearERC(){
    clearInterval(this.fbinterval);
    this.loggedOutFBauth();
    this.storage.clear("MoneroAUXETHTransactionRA");
    this.storage.clear("MoneroAUXETHTransactionWA");
    this.storage.clear("MoneroAUXETHTransactionWN");
    this.storage.clear("MoneroAUXETHTransaction_id");
    this.storage.clear("MoneroAUXETHTransaction_to_address");
    this.storage.clear("MoneroAUXETHTransaction_token_amount");
    this.stepRecieveETH = 0;
    this.ethmodaltitle = "Pay through ETH";
    this.ethwalletname = "0";
    this.ethwalletaddress="";
    this.ethrefundaddress="";
    this.toETH=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
    this.toETHRefund=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 2 screen
    //this.toETHConfirm= 0;
    this.progresstype = "danger";
    this.progressvalue = 0;
    this.progressshow = false;
    this.initialCount = 0;
    this.message = "";this.message1 = "";
    this.showtransidin3 = '';
    if(this.stepRecieveETH == 0){
      location.reload();
    }
    this.activityServ.putActivityInPouch("UserhomebtcmodalComponent","clearERC()","Modal closed for btc transaction","");                
    
  }

  roundUp(num, precision) {
    return Math.ceil(num * precision) / precision
  }

  copytext(ethaddress){
    this.toastr.info(null, 'Address copied to your clipboard.',{timeOut:1500});
  }

}
