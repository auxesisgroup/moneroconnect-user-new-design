import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppRoutingModule } from  './app.routes';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ClipboardModule } from 'ngx-clipboard';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { CookieService } from 'ngx-cookie-service';
import { OrderModule } from 'ngx-order-pipe';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { ChartsModule } from 'ng2-charts';
import { ShareButtonsModule } from 'ngx-sharebuttons';
// import { CeiboShare } from 'ng2-social-share';
import { ImageViewerModule } from '@hallysonh/ngx-imageviewer';
import { ParticlesModule } from 'angular-particle';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import {Ng2Webstorage} from 'ngx-webstorage';

import { SignupService } from './services/signup.service';
import { FbapiService } from './services/fbapi.service';
import { ServiceapiService } from './services/serviceapi.service';
import { PouchService } from './services/pouch.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PageotpComponent } from './pageotp/pageotp.component';
import { UsertermsComponent } from './userterms/userterms.component';
import { UserkycComponent } from './userkyc/userkyc.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
// import { PagetestComponent } from './pagetest/pagetest.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { UserhomebtcmodalComponent } from './userhomemodals/userhomebtcmodal/userhomebtcmodal.component';
import { UserhomeethmodalComponent } from './userhomemodals/userhomeethmodal/userhomeethmodal.component';
import { UserhomebnkmodalComponent } from './userhomemodals/userhomebnkmodal/userhomebnkmodal.component';
import { SidemenuComponent } from './layouts/sidemenu/sidemenu.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { UserhomeComponent } from './userhome/userhome.component';
import { ReferralComponent } from './referral/referral.component';
import { AddreferralComponent } from './addreferral/addreferral.component';
import { UsertermsdescriptionComponent } from './usertermsdescription/usertermsdescription.component';
import { AddreferralwithsidebarComponent } from './addreferralwithsidebar/addreferralwithsidebar.component';
import { KycwithsidebarComponent } from './kycwithsidebar/kycwithsidebar.component';
import { KycwithsidebarviewpdfComponent } from './kycwithsidebarviewpdf/kycwithsidebarviewpdf.component';

// export const firebaseConfig = {
//   "apiKey": "AIzaSyCdpzVX0tq6uLoEgBpwEXDH7wr4zDnkcHQ",
//   "authDomain": "token-baazar.firebaseapp.com",
//   "databaseURL": "https://token-baazar.firebaseio.com",
//   "projectId": "token-baazar",
//   "storageBucket": "token-baazar.appspot.com",
//   "messagingSenderId": "264678856939"
// }

export const firebaseConfig = {
  "apiKey": "AIzaSyBMsLUf7d6anHBiOTYzrQUaOhI-g8EhBH4",
  "authDomain": "proud-parity-131813.firebaseapp.com",
  "databaseURL": "https://proud-parity-131813.firebaseio.com",
  "projectId": "proud-parity-131813",
  "storageBucket": "proud-parity-131813.appspot.com",
  "messagingSenderId": "829650100337"
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PageotpComponent,
    UsertermsComponent,
    UserkycComponent,
    PagenotfoundComponent,
    // PagetestComponent,
    NavbarComponent,
    UserhomebtcmodalComponent,
    UserhomeethmodalComponent,
    UserhomebnkmodalComponent,
    SidemenuComponent,
    TransactionsComponent,
    UserhomeComponent,
    ReferralComponent,
    AddreferralComponent,
    UsertermsdescriptionComponent,
    AddreferralwithsidebarComponent,
    KycwithsidebarComponent,
    KycwithsidebarviewpdfComponent,
    // CeiboShare
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule,
    AppRoutingModule,//Initializing routes
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      maxOpened:1,
      preventDuplicates:true
    }),
    Ng2Webstorage,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgxQRCodeModule.forRoot(),
    ClipboardModule,
    OrderModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0.4)', 
      backdropBorderRadius: '0px',
      primaryColour: '#c2e9f9', 
      secondaryColour: '#c2e9f9', 
      tertiaryColour: '#c2e9f9',
      fullScreenBackdrop:true
    }),
    ChartsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ShareButtonsModule.forRoot(),
    ImageViewerModule,
    ParticlesModule
  ], 
  providers: [
    SignupService, 
    ServiceapiService,
    PouchService,
    FbapiService,
    CookieService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    // {provide: CeiboShare, useFactory: CeiboShare, deps: [CeiboShare], multi: true }
    // CeiboShare
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
