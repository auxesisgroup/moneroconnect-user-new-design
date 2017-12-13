import { Component, OnInit } from '@angular/core';

import { ServiceapiService } from '../services/serviceapi.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap'; //to fetch url params


import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import { SignupService } from '../services/signup.service';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

import { FbapiService } from '../services/fbapi.service';

import 'hammerjs';
import * as urlencode from 'urlencode';
import * as _ from 'lodash';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-kycwithsidebarviewpdf',
  templateUrl: './kycwithsidebarviewpdf.component.html',
  styleUrls: ['./kycwithsidebarviewpdf.component.css'],
  providers:[SignupService,FbapiService]
})
export class KycwithsidebarviewpdfComponent implements OnInit {

  public ngxloading  = false;
  kycimg:any = 'assets/img/kyc3.jpg';
  constructor(
    public api:ServiceapiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // console.log(this.api.retrieveFromLocal("AUXDOCImageAddressProof"))
    this.ngxloading = true;
    this.loadPDF();
    
  }

  loadPDF(){
    let token = this.route.snapshot.paramMap.get("id");
    // console.log(token)
    this.kycimg = token;
    setTimeout(()=>{
      this.ngxloading = false;
    },5000);
  }

  back(){
    history.back();
  }

}
