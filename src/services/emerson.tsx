"use server"
import fs from "fs";
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
        let cache;
        switch(process.env.EDOCS_ENV.toLocaleUpperCase()){
            case "STG":
                cache = JSON.parse(fs.readFileSync('./tempfiles/filename_list_stg.json').toString());
                break;
            default:
                cache = JSON.parse(fs.readFileSync('./tempfiles/filename_list.json').toString());
                break;
        }
        
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