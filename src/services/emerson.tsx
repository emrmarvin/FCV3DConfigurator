"use server"
import fs from "fs";
import { uploadFile } from "./Autodesk";
import { returndata_type } from '../types/responses'

const mode = "cache";

export const getCache =  ()=>{
    let cache = JSON.parse(fs.readFileSync('./tempfiles/cache.json').toString());
    let cached_filenames :any = {};
    for(let i=0;i<cache.items.length;i++){
        cached_filenames[cache.items[i].objectKey] = {urn : btoa(cache.items[i].objectId),location:cache.items[i].location};
    }
    return cached_filenames;
} 
export const searchFile = async (props : {filename : string})=>{{
    console.log('searching',props.filename)
    if(mode == "cache"){
        let cache = JSON.parse(fs.readFileSync('./tempfiles/filename_list.json').toString());
        let data : any = {data:[]};
        if(cache[props.filename] != undefined){
            data = {data:[cache[props.filename]]}
        }
        return data;
    }else{
        let url = "";
        let req = await fetch(url,{
            method: "POST",
            body : JSON.stringify({
                "criteria":[{
                    "fieldname": "dDocTitle",
                    "matchMode": "contains",
                    "value": props.filename
                }]
            })
        })
        let res = await req.json();
        return await res;
    }
}}
export const downloadFile = async (props : {url : string,filename:string,filekey:string})=>{
    let cached_filenames = getCache();
    let returndata : returndata_type ={msg:"",urn:"",location:"",objectKey:""};
    if(cached_filenames[props.filename] != undefined){
        let file = fs.readFileSync('./tempfiles/'+props.filename);
        returndata = {msg:"cached",urn:cached_filenames[props.filename].urn,location:cached_filenames[props.filename].location,objectKey:cached_filenames[props.filename].objectKey}
        return returndata
    }
    returndata.msg = "no cache";
    if(mode == "cache"){
        return returndata;
    }
    
    console.log('downloading...')
    let success : boolean = false;
        while(success === false){
            success = true;
        }
    let file_req = await fetch("https://cof-dev.emerson.com/apps/cad_api/api/drawing3d/v1/get-drawing-item?url="+props.url,{
        method:"POST"
    })
    let blob = await file_req.arrayBuffer();
    console.log("status",file_req.status);
    
    returndata = await uploadFile({bucketname:"daniel_viewer_testing",filetoupload:props.filename,filestream:blob}) as returndata_type;
    // let wr = await req.arrayBuffer();
    // let buffed = Buffer.from(wr);
    return returndata;
}