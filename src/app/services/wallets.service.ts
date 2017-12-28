import { Injectable } from '@angular/core';
import * as moment from 'moment';
import _ from 'lodash';
@Injectable()
export class WalletsService {
  
  wallet:any;
  bindr:any = [];
  constructor(

  ) { 
    this.wallet = [
      {
        id:1,
        type:"compatible",
        value:"compatible",
        text:"Compatible Wallets",
        wallet:[
          { id:1,value:"MetaMask",text:"MetaMask" },
          { id:2,value:"Parity",text:"Parity" },
          { id:3,value:"Mist",text:"Mist" },
          { id:4,value:"MyEtherWallet",text:"MyEtherWallet" },
          { id:5,value:"imToken",text:"imToken" },
          { id:6,value:"I-hold-my-Ethereum-private-keys",text:"I hold my Ethereum private keys" }
        ]
      },
      {
        id:2,
        type:"incompatible",
        value:"incompatible",
        text:"Incompatible Wallets",
        wallet:[
          { id:1,value:"Coinbase",text:"Coinbase" },
          { id:2,value:"Globitex",text:"Globitex" },
          { id:3,value:"Kraken",text:"Kraken" },
          { id:4,value:"Poloniex",text:"Poloniex" },
          { id:5,value:"Bittrex",text:"Bittrex" },
          { id:6,value:"Jaxx",text:"Jaxx" },
          { id:7,value:"Coinomi",text:"Coinomi" },
          { id:8,value:"Exchange",text:"Exchange (any other cryptocurrency exchange)" },
          { id:9,value:"Wallet",text:"Wallet (other)" },
          { id:10,value:"I-dont-know",text:"I don't know what wallet I am using" },
        ]
      }
    ];
  }

  loadWallets(){
    return this.wallet;
  }

  loadWalletFilter(str){
    this.bindr = [];
    let i = 0;
    _.forEach(this.wallet,(value,key)=>{
      // console.log(value,key)
      _.forEach(value.wallet,(v,k)=>{
        i = i+1;
        this.bindr.push({
          rowid:i,
          childid:v.id,
          value:v.value,
          for:value.type,
          text:v.text,
          title:value.text
        })
      })
    })
    // console.log(this.bindr);
    let find = _.find(this.bindr,(o)=>{
      if(o.value == str){
        return o;
      }
    });
    return find.for;
  }

}
