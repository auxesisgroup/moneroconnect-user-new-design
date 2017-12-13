import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
export interface Info {
  name:string;
}
@Injectable()
export class TestService {

  items:any = [];
  constructor() {
    this.items =  [
      { name:"hi", id:1},
      { name:"bi", id:2}
    ];
  }

  getItemList(){
    return this.items;
  }

  push(name,id){
    //console.log(name,id)
    this.items.push({name:name,id:id});
  }
}
