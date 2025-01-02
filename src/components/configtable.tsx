"use client"
import React, { useEffect, useState,useMemo } from 'react';
import { createToken,retrieveFields } from '../services/Autodesk';
import {  searchFile } from '../services/emerson';
import Viewer from '../components/Viewer';
import { returndata_type } from '../types/responses';

const Configtable: React.FC = () => {
  const labels = {
    confirm : <label>Confirm</label>,
    download: <label>Download</label>
  }
  type csvdata = {easy_e : string[],gx:string[],vball:string[]}
  const [data,setData] = useState<string[]>([]);
  const [csv,setCSV] = useState<csvdata>({easy_e : [],gx:[],vball:[]});
  const [sizelist,setSizelist] = useState([""]);
  const [bonnetlist,setBonnetlist] = useState([""]);
  const [pressurelist,setpressurelist] = useState([""]);
  const [yokebosslist,setYokebosslist] = useState([""]);
  const [actuatorlist,setActuatorlist] = useState([""]);
  const [flangelist,setFlangelist] = useState([""]);
  const [confirmlabel,setConfirmlabel] = useState(labels.confirm);
  const [downloadlabel,setDownloadlabel] = useState(labels.download);
  const [headerindex,setHeaderindex]  = useState<{Size: number,Actuator:number,Pressure:number,Bonnet:number,Yokeboss:number,Flange:number,Key:number}>({Size:NaN,Actuator:NaN,Pressure:NaN,Bonnet:NaN,Yokeboss:NaN,Flange:NaN,Key:NaN});
  var loadingsvg = <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
  </svg>
  type FiltersType = {
    size: string[],
    bonnet: string[],
    pressure: string[],
    yokeboss: string[],
    actuator: string[],
    flange : string[]
  };
  
  const [filters, setFilters] = useState<FiltersType>({
    size: [],
    bonnet: [],
    pressure: [],
    yokeboss: [],
    actuator: [],
    flange: []
  });
  const [selectfilters, setSelectfilter] = useState<FiltersType>({
    size: [],
    bonnet: [],
    pressure: [],
    flange : [],
    yokeboss: [], 
    actuator: []
  });
  const [urn,setUrn] = useState("");
  const [filedata,setFiledata] = useState<{msg : null | string,urn:null | string,location:null | string}>();
  const [urncount,setUrncount] = useState(0);
  const [token,setToken] = useState("");
  const [confirmStatus,setConfirmstatus] = useState(false);
  const [product,setProduct] = useState("Easy-E");
  const [edocs_url,setEdocs] = useState("");
  const [acc_url,setAcc] = useState("");

  useEffect(()=>{
    clear();
  },[product])
  useEffect(()=>{
    let promises = [];
    promises.push(new Promise((resolve,reject)=>{
      fetch("/easy_e.csv").then(async function(res){
        let resdata = await res.text();
        let resdatav = resdata.replaceAll("\r","").split("\n");
        resolve(resdatav);
      })
    }));
    promises.push(new Promise((resolve,reject)=>{
      fetch("/gx.csv").then(async function(res){
        let resdata = await res.text();
        let resdatav = resdata.replaceAll("\r","").split("\n");
        resolve(resdatav);
      })
    }));
    promises.push(new Promise((resolve,reject)=>{
      fetch("/vball.csv").then(async function(res){
        let resdata = await res.text();
        let resdatav = resdata.replaceAll("\r","").split("\n");
        resolve(resdatav);
      })
    }));
    Promise.all(promises).then((res1 : any)=>{
      let easy_e = res1[0];
      let gx = res1[1];
      let vball = res1[2];
      let rdata = {
        easy_e : easy_e,
        gx : gx,
        vball : vball
      }
      setCSV(rdata);
      setData(rdata.easy_e);
    })
    createToken().then(async function(res : any){
      setToken(res.token);
      setEdocs(res.edocs_url);
      setAcc(res.acc_url);
    })
    let sql_data = {}
    let drawing_list = {}
    retrieveFields().then(function(res:[{model_name:string}]){
      for(let i=0;i<res.length;i++){
        let row  = res[i];
        if(sql_data[row.model_name] == undefined){
          sql_data[row.model_name] = [row['field_name']]
        }else if(!sql_data[row.model_name].includes(row['field_name'])){
          sql_data[row.model_name].push(row['field_name'])
        }
        if(drawing_list[row['value']] == undefined){
          drawing_list[row['value']] = [row]
        }else{
          drawing_list[row['value']].push(row)
        }
      }
    })
    console.log(sql_data)
    console.log(drawing_list)
  },[]);
  useEffect(()=>{
    if(data.length == 0){return}
    let newdata : string[] = [data[0]];
    let newheaderindex = headerindex;
    if(data == undefined){return}
    try{
      let header = data[0].split(",");
      header.map((head,i)=>{
        switch(head){
          case "Size": headerindex.Size = i;
          break;
          case "Actuator": headerindex.Actuator = i;
          break;
          case "Bonnet": headerindex.Bonnet = i;
          break;
          case "Pressure Class": headerindex.Pressure = i;
          break;
          case "Yokeboss" : headerindex.Yokeboss = i;
          break;
          case "Name" : headerindex.Key = i;
          break;
          case "Flange" : headerindex.Flange = i;
          break;
        }
      })
      setHeaderindex(newheaderindex);
    }catch(ex){}
    for(let i=0;i<data.length;i++){
      let row = data[i].split(",");
      if(!filters.size.includes(row[headerindex.Size]) && filters.size.length != 0){ continue; }
      if(!filters.pressure.includes(row[headerindex.Pressure]) && filters.pressure.length != 0){ continue; }
      if(!filters.bonnet.includes(row[headerindex.Bonnet]) && filters.bonnet.length != 0){ continue; }
      if(!filters.yokeboss.includes(row[headerindex.Yokeboss]) && filters.yokeboss.length != 0){ continue; }
      if(!filters.actuator.includes(row[headerindex.Actuator]) && filters.actuator.length != 0){ continue; }
      if(!filters.flange.includes(row[headerindex.Flange]) && filters.flange.length != 0){ continue; }
      if(!newdata.includes(data[i]) && data[i] != '' && data[i] != undefined){
        newdata.push(data[i]); 
      }
    }
    let newfilters : FiltersType = {
        size: [],
        bonnet: [],
        pressure: [],
        yokeboss: [],
        actuator: [],
        flange: []
    }
    for(let i=0;i<newdata.length;i++){
      let row = newdata[i].split(",");
      if(!newfilters.size.includes(row[headerindex.Size])){ newfilters.size.push(row[headerindex.Size])}
      if(!newfilters.pressure.includes(row[headerindex.Pressure])){ newfilters.pressure.push(row[headerindex.Pressure])}
      if(!newfilters.bonnet.includes(row[headerindex.Bonnet])){ newfilters.bonnet.push(row[headerindex.Bonnet])}
      if(!newfilters.yokeboss.includes(row[headerindex.Yokeboss])){ newfilters.yokeboss.push(row[headerindex.Yokeboss])}
      if(!newfilters.actuator.includes(row[headerindex.Actuator])){ newfilters.actuator.push(row[headerindex.Actuator])}
      if(!newfilters.flange.includes(row[headerindex.Flange])){ newfilters.flange.push(row[headerindex.Flange])}
    }
    setSelectfilter(newfilters);
    setData(newdata);
  },[filters]);
  useEffect(()=>{
    csvdatac();
  },[data])
  function csvdatac(){
    let newsizelist = [""];
    let newpressurelist = [""];
    let newbonnetlist = [""];
    let newyokebosslist = [""]; 
    let newactuatorlist = [""];
    let newflangelist = [""];
    let newheaderindex = headerindex;
    try{
      let header = data[0].split(",");
      header.map((head,i)=>{
        switch(head){
          case "Size": headerindex.Size = i;
          break;
          case "Actuator": headerindex.Actuator = i;
          break;
          case "Bonnet": headerindex.Bonnet = i;
          break;
          case "Pressure Class": headerindex.Pressure = i;
          break;
          case "Yokeboss" : headerindex.Yokeboss = i;
          break;
          case "Flange type" : headerindex.Flange = i;
          break;
          case "Name" : headerindex.Key = i;
          break;
        }
      })
      setHeaderindex(newheaderindex);

      
      for(let i=1;i<data.length;i++){
        let row : string[] = data[i].split(',');
        if(!newsizelist.includes(row[headerindex.Size])){
          newsizelist.push(row[headerindex.Size]);
        }
        if(!newpressurelist.includes(row[headerindex.Pressure])){
          newpressurelist.push(row[headerindex.Pressure]);
        }
        if(!newbonnetlist.includes(row[headerindex.Bonnet])  ){
          newbonnetlist.push(row[headerindex.Bonnet]);
        }
        if(!newyokebosslist.includes(row[headerindex.Yokeboss])) {
          newyokebosslist.push(row[headerindex.Yokeboss]);
        }
        if(!newactuatorlist.includes(row[headerindex.Actuator]) ){ 
          newactuatorlist.push(row[headerindex.Actuator]);
        } 
        if(!newflangelist.includes(row[headerindex.Flange])){
          newflangelist.push(row[headerindex.Flange]);
        }
      }
      setBonnetlist(newbonnetlist);
      setActuatorlist(newactuatorlist);
      setYokebosslist(newyokebosslist);
      setpressurelist(newpressurelist);
      setSizelist(newsizelist);
      setFlangelist(newflangelist);
    }catch(ex){

    }
  }

  function clear(){
    switch(product){
      case "Easy-E": setData(csv.easy_e)
      break;
      case "GX": setData(csv.gx)
      break;
      case "V-Ball": setData(csv.vball)
      break;
    }
    try{(document.getElementById("pressure") as HTMLSelectElement).selectedIndex = 0}catch(ex){};
    try{(document.getElementById("size") as HTMLSelectElement).selectedIndex = 0 }catch(ex){};
    try{(document.getElementById("bonnet") as HTMLSelectElement).selectedIndex = 0 }catch(ex){};
    try{(document.getElementById("yokeboss") as HTMLSelectElement).selectedIndex = 0 }catch(ex){};
    try{(document.getElementById("actuator") as HTMLSelectElement).selectedIndex = 0 }catch(ex){};
    try{(document.getElementById("flange") as HTMLSelectElement).selectedIndex = 0 }catch(ex){};
    setFilters({size:[],bonnet:[],pressure:[],yokeboss:[],actuator:[],flange:[]});
    setUrn("");
    setFiledata({msg:null,location:null,urn:null});
  }
  function filter(e : any){
    let filtervalue = (e.target as HTMLInputElement).value;
    let filterid = (e.target as HTMLInputElement).id;
    let value  : FiltersType = {size:[],bonnet:[],pressure:[],yokeboss:[],actuator:[],flange:[]};

    switch(filterid){
      case "size":
        value.size = [filtervalue];
        break;
      case "pressure":
        value.pressure= [filtervalue];
        break;
      case "bonnet":
        value.bonnet= [filtervalue];
        break;
      case "yokeboss":
        value.yokeboss= [filtervalue];
        break;
      case "actuator":
        value.actuator= [filtervalue];
        break;
      case "flange":
        value.flange = [filtervalue]
    }
    setFilters(value);
    return;
  }
  if(token == ""){
    var drawingsviewer =  <div>{loadingsvg}</div>
  }else{
    // var drawingsviewer = <Viewer runtime={{ accessToken: token }} urn={urn} />
    var drawingsviewer = <iframe className="w-11/12 h-[90vh] border-4" src={urn} />
  }
  function getOptions(list : string[],key:string,title:string,select_id:string){
    return <div className="relative z-0 w-full mb-5 group">
    <label htmlFor="size" className="block ml-5 mb-1 text-sm font-medium text-gray-900 dark:text-white">{title}</label>
    <select defaultValue={""} className="filter_select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" id={select_id} name={select_id} onChange={filter}>
      {list.map(function(item,i){
        let status = true;
        let display = item;
        let classes = "";
        if(!selectfilters[key as keyof typeof selectfilters].includes(item) && selectfilters[key as keyof typeof selectfilters].length != 0){ status = true; }else{status=false}
        let selected = false;
        if(i==0){display = "-- Select --"; classes="text-center";selected=true;}
        let element = <option className={classes} disabled={status} key={"select_" + item + i} value={item}>{display}</option>
        if((item != "" && item != null && item != undefined) || i ==0){
          return element
        }
      })}
    </select>
    </div>
  }

  var easy_group;
  if(product == "Easy-E"){
  easy_group = <div id="Easy-group" className="grid md:grid-cols-1 md:gap-0 mt-1 p-0">
    {getOptions(sizelist,"size","Size","size")}
    {getOptions(pressurelist,"pressure","Pressure Class / Flange","pressure")}
    {getOptions(bonnetlist,"bonnet","Bonnet","bonnet")}
    {getOptions(yokebosslist,"yokeboss","Yokeboss","yokeboss")}
    {getOptions(actuatorlist,"actuator","Actuator","actuator")}
  </div>
  }
  var vball_group 
  if(product == "V-Ball"){
    vball_group = <div id="VBall-group" className="grid md:grid-cols-1 md:gap-0 mt-1 p-0">
      {getOptions(sizelist,"size","Size","size")}
      {getOptions(pressurelist,"pressure","Pressure Class","pressure")}
      {getOptions(flangelist,"flange","Flange","flange")}
      {getOptions(actuatorlist,"actuator","Actuator","actuator")}
    </div>
  }
  var gx_group;
  if(product == "GX"){
    gx_group = <div id="GX-group" className="grid md:grid-cols-1 md:gap-0 mt-1 p-0">
      {getOptions(sizelist,"size","Size","size")}
      {getOptions(pressurelist,"pressure","Pressure Class","pressure")}
      {getOptions(flangelist,"flange","Flange","flange")}
      {getOptions(bonnetlist,"bonnet","Bonnet","bonnet")}
      {getOptions(actuatorlist,"actuator","Actuator","actuator")}
    </div>
  }
  return (
    <div>
      <div className="grid md:grid-cols-5 md:gap-0 mt-5 p-0 h-100">
        <form className='max-w-max mx-auto col-span-1 '>
        <div className="grid md:grid-cols-1 md:gap-0 mt-5 p-0">
            <div className="relative z-0 w-full mb-5 group">
            <label htmlFor="size" className="block ml-5 mb-1 text-sm font-medium text-gray-900 dark:text-white">Product</label>
              <select className="filter_select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" id="Product" name="Product" onChange={(e)=>{
                  let productvalue = (e.target as HTMLSelectElement).value;          
                  setProduct(productvalue)
              }}>
              <option key="Easy-E" value="Easy-E">Fisher™ easy-e™ control valve</option>
              <option key="GX" value="GX">Fisher™ GX control valve</option>
              <option key="V-Ball" value="V-Ball">Fisher™ Vee-Ball™ control valve</option>
            </select>
          </div>
        </div>
        { vball_group }
        { gx_group }
        { easy_group }
        <label className="block ml-5 mb-1  text-sm font-medium text-gray-900 dark:text-white">Measurement</label>
        <ul className="ml-5 items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                <div className="flex items-center ps-3">
                    <input defaultChecked id="measurement_english" type="radio" name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">English </label>
                </div>
            </li>
            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                <div className="flex items-center ps-3">
                    <input id="measurement_metric" type="radio" name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Metric</label>
                </div>
            </li>
        </ul>
        <div className="relative z-0 w-full mb-1 group p-0">
        <button disabled={confirmStatus} id="confirmbutton" className='mt-3 filter_select text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800' onClick={async(e)=>{
            e.preventDefault(); 
            setConfirmstatus(true);
            try{
              if(data.length == 2){
                setConfirmlabel(loadingsvg);
                let measurement = (document.getElementById("measurement_metric") as HTMLSelectElement)["checked"];
                if(measurement){
                  measurement = "Metric";
                }else{
                  measurement = "English";
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                let filename = data[1].split(",")[headerindex.Key]
                let payload = {
                  "document_sets": [{
                      "model_codes": [
                        {
                            "model_code": filename,
                            "label": "Viewer",
                            "units": measurement,
                            "formats": {
                              "3d": [
                                "dxf",
                                "igs",
                                "stp"
                              ],
                              "2d": [
                                "dxf",
                                "pdf"
                              ]
                            }
                        }
                      ]
                    }]
                }
                console.log(payload)
                let encoded=encodeURIComponent(JSON.stringify(payload));
                setConfirmlabel(labels.confirm);
                setConfirmstatus(false);
                setUrn(`${acc_url}/?system=fcv&payload=${encoded}`);
                return;
              }else{
                console.log(data);
                alert("Filter please")
              }
            }catch(ex){}
            setConfirmlabel(labels.confirm);
            setConfirmstatus(false);
          }}>{confirmlabel}</button>
         <button className='filter_select text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'   onClick={async(e)=>{
            e.preventDefault();
            clear();
            }}>Clear
          </button>
        </div>
        <button className={filedata?.location? 'filter_select text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800' : 'invisible' } onClick={async(e)=>{
              e.preventDefault();
              setDownloadlabel(loadingsvg);
              const a = document.createElement("a");
              document.body.appendChild(a);
              a.href = filedata?.location as string;
              a.target = "_blank"
              a.download = data[0].split(",")[5];
              a.click();
              document.body.removeChild(a);
              setDownloadlabel(labels.download);
            }}>{downloadlabel}
          </button>
        </form>
        <div className='col-span-4 w-full h-full'>
        {drawingsviewer}
        </div>
      </div>
    </div>
  );
}


export default Configtable;

