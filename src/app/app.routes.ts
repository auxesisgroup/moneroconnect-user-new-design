import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppComponent }   from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PageotpComponent } from './pageotp/pageotp.component';
import { UserhomeComponent } from './userhome/userhome.component';
import { UsertermsComponent } from './userterms/userterms.component';
import { UserkycComponent } from './userkyc/userkyc.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
// import { PagetestComponent } from './pagetest/pagetest.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
// import { UserhomebtcmodalComponent } from './userhomemodals/userhomebtcmodal/userhomebtcmodal.component';
// import { UserhomeethmodalComponent } from './userhomemodals/userhomeethmodal/userhomeethmodal.component';
// import { UserhomebnkmodalComponent } from './userhomemodals/userhomebnkmodal/userhomebnkmodal.component';
import { SidemenuComponent } from './layouts/sidemenu/sidemenu.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReferralComponent } from './referral/referral.component';
import { AddreferralComponent } from './addreferral/addreferral.component';
import { AddreferralwithsidebarComponent } from './addreferralwithsidebar/addreferralwithsidebar.component';
import { KycwithsidebarComponent } from './kycwithsidebar/kycwithsidebar.component';
import { KycwithsidebarviewpdfComponent } from './kycwithsidebarviewpdf/kycwithsidebarviewpdf.component';


const routes: Routes = [
    { 
        path: '', 
        //redirectTo: '/login', 
        component:LoginComponent,
        pathMatch: 'full' ,
        data: { title: 'Login | Liteconnect ICO' }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login | Liteconnect ICO' }
    },
    {
        path: 'otp/:token',
        component: PageotpComponent,
        data: { title: 'OTP | Liteconnect ICO' }
    },
    {
        path: 'terms/:token',
        component: UsertermsComponent,
        data: { title: 'Terms | Liteconnect ICO' }
    },
    {
        path: 'kyc',
        component: UserkycComponent,
        data: { title: 'KYC | Liteconnect ICO' }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login | Liteconnect ICO' }
    },
    {
        path: 'login/:why', 
        component: LoginComponent,
        data: { title: 'Login | Liteconnect ICO' }
    }, 
    {
        path: 'home',
        component: UserhomeComponent,
        data: { title: 'Home | Liteconnect ICO' }
    },
    {
        path: 'transactions',
        component: TransactionsComponent,
        data: { title: 'Transactions | Liteconnect ICO' }
    },
    {
        path: 'referral',
        component: ReferralComponent,
        data: { title: 'Referral | Liteconnect ICO' }
    },
    {
        path: 'referral/address',
        component: ReferralComponent,
        data: { title: 'Referral | Liteconnect ICO' }
    },
    {
        path: 'referral/address/:refid',
        component: ReferralComponent,
        data: { title: 'Referral | Liteconnect ICO' }
    },
    {
        path: 'addreferral',
        // component: AddreferralComponent
        component: AddreferralwithsidebarComponent,
        data: { title: 'Referral Address | Liteconnect ICO' }
    },
    {
        path: 'updatekyc',
        component: KycwithsidebarComponent,
        data: { title: 'KYC | Liteconnect ICO' }
    },
    {
        path: 'updatekyc/view/:id',
        component: KycwithsidebarviewpdfComponent,
        data: { title: 'KYC | Liteconnect ICO' }
    },
    // {
    //     path: 'test',
    //     component: PagetestComponent
    // },
    {
        path: 'homedum',
        component: HomeComponent,
        data: { title: 'DUMHOME | Liteconnect ICO' }
    },
    { 
        path: '**', 
        component: PagenotfoundComponent ,
        data: { title: 'Not Found | Liteconnect ICO' }
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {}