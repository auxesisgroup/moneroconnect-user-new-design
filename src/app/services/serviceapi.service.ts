import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import sha512 from 'js-sha512';
import CryptoJS from 'crypto-js';

declare var window : any;

@Injectable()
export class ServiceapiService {

  private url:string;
  
  headers: Headers;
  options: RequestOptions;

  constructor(
    public http:Http,
    private storage:LocalStorageService
  ) { 
    this.url = this.storage.retrieve("AUXUserUrl");//localStorage.getItem("AUXUserUrl");
    
    this.headers = new Headers({ 
      'Content-Type': 'application/json', 
      'Accept': 'q=0.8;application/json;q=0.9' 
    });
    this.options = new RequestOptions({ headers: this.headers }); 
  }

  public makeApi(apimethod:string):Observable<any>{
    //console.log("im called");
    return this.http
            .get("https://freegeoip.net/json/"+apimethod)
            .map(this.extractData);
  }

  public sendapi(){
    let d = {msg:"ok"};
    return JSON.stringify(d);
  }

  public resolveApi(apimethod:string,data:Object):Observable<any>{
    let passData =  JSON.stringify(data);
    return this.http.post(this.url+apimethod,passData).map(this.extractData);
  }

  private extractData(res: Response) {
      let body = res.json();
      return body || {};
  }
  private handleError(error: any) {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      // console.error(errMsg);
      return Observable.throw(errMsg);
  }


  /**
   * local saving for transactions
   */
   saveToLocal(name,str){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    //console.log(token)
    let storeStr = (CryptoJS.AES.encrypt(str,token)).toString();
    //console.log(storeStr)
    this.storage.store(name,storeStr);
  }

  retrieveFromLocal(name){
    let token = this.storage.retrieve("secureLocalTokenAuth");
    let fromStorage = this.storage.retrieve(name);
    if(fromStorage == null || fromStorage == "" || !fromStorage){
      return null;
    }else{
      let getDecrypt = CryptoJS.AES.decrypt(fromStorage,token);
      let finalStr = getDecrypt.toString(CryptoJS.enc.Utf8);
      return finalStr;
    }
  }
  /**
   * END transaction storing
   */

  public retrieveRateListFromJSON(){
    return this.http.get("assets/data/Masscrypratelist.json").map(this.extractData);
  }


  callCSV(){
    //new fileReader 
    var fileReader = new FileReader();
    // console.log(fileReader)
    // fileReader.readAsDataURL(File({name:'assets/data/main.csv'}));
    // //try to read file, this part does not work at all, need a solution
    // fileReader.onload = function(e) {
    //   console.log("fileReader.onload");
      
    //   console.log(e)

    // }

    //window.requestFileSystem(window.TEMPORARY, 1024*1024, this.readFile, this.errorHandler);
    // console.log(window,window.webkitRequestFileSystem,window.webkitResolveLocalFileSystemURL)

    // let f = window.webkitRequestFileSystem;
    // console.log(f)

     

    // this.http.get("assets/data/main.csv")
    // .subscribe(
    //   d=>{
    //     console.log(d)
    //   },
    //   e=>{
    //     console.error(e)
    //   }
    // );
  }
  readFile(fs) {
    
      fs.root.getFile('assets/data/main.csv', {}, function(fileEntry) {
    
        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function(file) {
           var reader = new FileReader();
    
           reader.onloadend = function(e) {
             console.log(e.target)
           };
    
           reader.readAsText(file);
        }, this.errorHandler);
    
      }, this.errorHandler);
    
  }
  writeFile(fs) {
    
      fs.root.getFile('assets/data/main.csv', {create: true}, function(fileEntry) {
    
        // Create a FileWriter object for our FileEntry (assets/data/main.csv).
        fileEntry.createWriter(function(fileWriter) {
    
          fileWriter.onwriteend = function(e) {
            console.log('Write completed.');
            // call `readFile` here
            // window.requestFileSystem(window.TEMPORARY, 1024*1024, readFile, errorHandler);
    
          };
    
          fileWriter.onerror = function(e) {
            console.log('Write failed: ' + e.toString());
          };
    
          // Create a new Blob and write it to log.txt.
          var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});
    
          fileWriter.write(blob);
    
        }, this.errorHandler);
    
      }, this.errorHandler);
    
  }
  errorHandler(e) {
    var msg = '';  
    console.log('Error: ' + msg);
  }

  extractCSVFile(res: Response){
    let csvData = res['_body'] || '';
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    for ( let i = 0; i < allTextLines.length; i++) {
        // split content based on comma
        let data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            let tarr = [];
            for ( let j = 0; j < headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    // this.csvData = lines;
  }
}
