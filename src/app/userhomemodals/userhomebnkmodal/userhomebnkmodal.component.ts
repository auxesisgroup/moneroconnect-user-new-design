import { Component, OnInit, TemplateRef } from '@angular/core';

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

import { UserhomeComponent } from '../../userhome/userhome.component';
@Component({
  selector: 'app-userhomebnkmodal',
  templateUrl: './userhomebnkmodal.component.html',
  styleUrls: ['./userhomebnkmodal.component.css'],
  providers:[ServiceapiService,SignupService]
})
export class UserhomebnkmodalComponent implements OnInit {

  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  }; 

  stepRecieveBNK:number = 0; //0 for wallet name n address, 1 for transaction form, 2 for congrats
  bankmodaltitle = "Pay through Bank (ERC20 Token)";

  // bank transaction form
  selectalias:any;
  amount:any;
  transid:any;
  selectbank:any;

  //param for bank payment
  bnkwalletname:string;
  bnkwalletaddress:any;
  bnkrefundaddress:any;
  toBank:number=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
  toBankConfirm:number = 0;//screen 3 for final submit
  
  loadingimage:boolean = false;
  
  message:any;

  constructor( 
    public serv:ServiceapiService,
    private storage:LocalStorageService,
    private toastr: ToastrService,
    public signup:SignupService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    
    //BNK
    this.stepRecieveBNK = 0;
    this.toBank = 0;//if user not submitted wallet address and wallet name
      //screen1
    let bnkwn = this.serv.retrieveFromLocal("MoneroAUXBankTransactionWN");//wallet name
    let bnkwa = this.serv.retrieveFromLocal("MoneroAUXBankTransactionWA");//wallet address
    //console.log(bnkwa,bnkwn)
    if((bnkwa == "" || bnkwa == null || bnkwa == undefined || !bnkwa) && (bnkwn == "" || bnkwn == undefined || bnkwn == null || !bnkwn)){
      this.toBank = 0;//show submitnextskip btn
    }else{
      this.toBank = 1;//show review and submit btn
      this.bnkwalletname = bnkwn;
      this.bnkwalletaddress = bnkwa;
    }
  }

  /**
   * 
   * @param val Modal Code
   */
  hideme(){
    
    //this.storage.clear("MoneroAUXsavelocalpaytype");
    //this.storage.clear("MoneroAUXsavelocalamount");
    this.modalRef.hide();
  }
  open_recieve_modal(modalBNK: TemplateRef<any>){
    //console.log(this.cas)
    //console.log(this.optradio)
    let type =this.signup.retrieveFromLocal("MoneroAUXsavelocalpaytype");
    let cash = this.signup.retrieveFromLocal("MoneroAUXsavelocalamount");
    //console.log(type,cash)
    if(cash == undefined || cash == "" || cash == null){
      this.toastr.error('Please give specific cash amount', 'Cash Invalid',{timeOut:2000});
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
              if(type == "bnk"){
                this.serv.saveToLocal("MoneroAUXBankTransaction_token_amount",cash);
                this.callforpaywithcurrencyonmodaltoshow("fiat",cash,modalBNK);
              }else{
                  this.loadingimage = false;
                  this.toastr.error('Choose any one payment method!', 'Not a payment type',{timeOut:2000});
              }
            }else{
              this.loadingimage = false;
              this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});  
            }
          }else{
            this.loadingimage = false;
            this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});  
          }
        },
        err=>{
          this.loadingimage = false;
          //console.error(err);
          this.toastr.error('CAS is invalid', 'Not a valid CAS',{timeOut:2500});
        }
      );

      
    }
  }  
  callforpaywithcurrencyonmodaltoshow(type,amount,modalBNK){
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
          if(type == "fiat"){
            this.serv.saveToLocal("MoneroAUXBankTransaction_id",_id);
            this.serv.saveToLocal("MoneroAUXBankTransaction_to_address",to_address);
            if(erc_address != "" || erc_address != null || erc_wallet != "" || erc_wallet != null){
              this.serv.saveToLocal("MoneroAUXBankTransactionWN",erc_wallet);
              this.serv.saveToLocal("MoneroAUXBankTransactionWA",erc_address);
            }
            this.modalRef = this.modalService.show(
              modalBNK,
              Object.assign({}, this.config, { class: 'gray modal-lg' })
            );
          }else{
            this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
          }
        }else{
          this.loadingimage = false;
          this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
        }
      },
      (err)=>{
        //console.error(err);
        this.loadingimage = false;
        this.toastr.error('Invalid currency detected', 'Not a valid CAS/Currency',{timeOut:2500});
      }
    );
  }
  //Modal

  

  //Screen1
  doTheseIfChangeDetectInBank(val){
    //console.log(this.bnkwalletaddress,this.bnkwalletname);//console.log(val.target.value);
    if(this.toBank == 1 || this.toBank == 2){
      let bnkwn = this.serv.retrieveFromLocal("MoneroAUXBankTransactionWN");//wallet name
      let bnkwa = this.serv.retrieveFromLocal("MoneroAUXBankTransactionWA");//wallet address
      if(bnkwa == val.target.value || bnkwn == val.target.value){ 
        this.toBank = 1;//stay with review and submit btn
        //console.log("Im not changed");
      }else{ 
        this.toBank = 2;//show update and submit
      }
    }
  }
  bnkwalletnamechange(val){//change wallet name from screen 1
    this.doTheseIfChangeDetectInBank(val);
  }
  bnkwalletaddresschange(val){
    this.doTheseIfChangeDetectInBank(val);
  }
  nextbnk1_1(){//if not store wallet name and wallet address
    if(this.bnkwalletname == "" || this.bnkwalletname == null || this.bnkwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.bnkwalletaddress == "" || this.bnkwalletaddress == null || this.bnkwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBankTransactionWN",this.bnkwalletname);
      this.serv.saveToLocal("MoneroAUXBankTransactionWA",this.bnkwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        'erc_address':this.bnkwalletaddress,
        'eth_wallet':this.bnkwalletname
      };//console.log(data);
      this.callingApiForBankScreen2("create_erc_address",data);
    }
  } 
  nextbnk1_2(){//if stored wallet name & address then to 2nd refund address modal
    this.serv.saveToLocal("MoneroAUXBankTransactionWN",this.bnkwalletname);
    this.serv.saveToLocal("MoneroAUXBankTransactionWA",this.bnkwalletaddress);
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      '_id':this.serv.retrieveFromLocal("MoneroAUXBankTransaction_id"),
      'currency':'fiat'
    };//console.log(data);
    this.callingApiForBankScreen2("review_erc_address",data);
  } 
  nextbnk1_3(){//if updated wallet name & address then to 2nd refund address modal
    if(this.bnkwalletname == "" || this.bnkwalletname == null || this.bnkwalletname == undefined){
      this.toastr.warning('Wallet name is required', 'Form is empty!');
    }else if(this.bnkwalletaddress == "" || this.bnkwalletaddress == null || this.bnkwalletaddress == undefined){
      this.toastr.warning('Wallet address is required', 'Form is empty!');
    }else{
      this.serv.saveToLocal("MoneroAUXBankTransactionWN",this.bnkwalletname);
      this.serv.saveToLocal("MoneroAUXBankTransactionWA",this.bnkwalletaddress);
      let data = {
        'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
        'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
        '_id':this.serv.retrieveFromLocal("MoneroAUXBankTransaction_id"),
        'currency':'fiat',
        'new_erc_address':this.serv.retrieveFromLocal("MoneroAUXBankTransactionWA"),
        'new_erc_wallet':this.serv.retrieveFromLocal("MoneroAUXBankTransactionWN")
      };//console.log(data);
      this.callingApiForBankScreen2("update_erc_address",data);

    }
  } 
  callingApiForBankScreen2(walletfor,data){//call web api for create_erc_address ***********web
    this.loadingimage = true;
    
    this.serv.resolveApi(walletfor,data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));//console.log(response);
        if(response.success == true || response.code == 200){
           this.stepRecieveBNK = 1;this.bankmodaltitle = "Pay through Bank (Detail Form)";
        }else{
          this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');
      }
    );
  }

  //screen2
  nextbnk2(){
    let amount = this.amount;
    let transid = this.transid;
    let alias = this.selectalias;
    let name = this.selectbank;
    if(amount == "" || amount == null || amount == undefined){
      this.toastr.warning('Amount is required', 'Form is empty!');
    }else if(transid == "" || transid == null || transid == undefined){
      this.toastr.warning('Transaction is required', 'Form is empty!');
    }else if(alias == "" || alias == null || alias == undefined){
      this.toastr.warning('Deposit method is required', 'Form is empty!');
    }else if(name == "" || name == null || name == undefined){
      this.toastr.warning('Bank name is required', 'Form is empty!');
    }else{
      //console.log(this.amount,this.transid,this.selectalias,this.selectbank);
      this.findingfiat_currency_for_approval(this.amount,this.transid,this.selectalias,this.selectbank);
    }
  }
  findingfiat_currency_for_approval(amount,transid,selectalias,selectbank){
    this.loadingimage = true;
    let data = {
      'email':this.serv.retrieveFromLocal("MoneroAUXUserEmail"),
      'token':this.serv.retrieveFromLocal("MoneroAUXHomeUserToken"),
      'payment_method':selectalias,
      'amount_deposited':amount,
      'transaction_id':transid,
      'deposit_bank':selectbank,
      '_id':this.signup.retrieveFromLocal("MoneroAUXBankTransaction_id")
    };console.log(data)
    this.serv.resolveApi("fiat_currency_for_approval",data)
    .subscribe(
      (res)=>{
        this.loadingimage = false;
        let response = JSON.parse(JSON.stringify(res));//console.log(response);
        if(response.success == true || response.code == 200){
          this.stepRecieveBNK = 2;
          this.bankmodaltitle = "Congratulations";
          let cas = this.serv.retrieveFromLocal("MoneroAUXBankTransaction_token_amount");
          let transaction_id = this.serv.retrieveFromLocal("MoneroAUXBankTransaction_id");
          this.message = cas+" CAS Token from transaction id "+transaction_id+"  is deposited in your account.";
          this.nexbnk3();
        }else if(response.code == 401){
          this.toastr.error('You are unauthorized to use', 'Wrong authentication!');  
          setTimeout(()=>{
            this.signup.logoutFromApp();
          },2000);
        }else{
          this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');  
        }
      },
      (err)=>{
        this.loadingimage = false;
        this.toastr.error('Wallet address & name is invalid', 'Wrong Input!');
      }
    );
  }

  //screen 3
  nexbnk3(){
    this.toastr.success('Bank transaction is done successfully', 'Transaction completed');
    setTimeout(()=>{
      this.hideme();
      this.storage.clear("MoneroAUXBankTransactionRA");
      this.storage.clear("MoneroAUXBankTransactionWA");
      this.storage.clear("MoneroAUXBankTransactionWN");
      this.storage.clear("MoneroAUXBankTransaction_id");
      this.storage.clear("MoneroAUXBankTransaction_to_address");
      this.storage.clear("MoneroAUXBankTransaction_token_amount");
      this.stepRecieveBNK = 0;
      this.bankmodaltitle = "Pay through Bank (ERC20 Token)";
      this.bnkwalletname = "";
      this.bnkwalletaddress="";
      this.bnkrefundaddress="";
      this.toBank=0;//0 for submitnextskip, 1 for reviewnext, 2 for updatenext in 1 screen
      this.toBankConfirm= 0;
      this.toastr.info('Wait for admin mail that verify transaction.', 'Note:',{timeOut:8000});
      this.toastr.info('You can make new transaction.', 'Make another transaction',{timeOut:3000});
      setTimeout(()=>{location.reload();},8000);
    },5000);
  }

}
