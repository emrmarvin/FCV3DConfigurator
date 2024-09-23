"use server"
import fs, { ReadStream } from "fs"
import { Readable } from 'stream';
import { returndata_type} from '../types/responses'
import { arrayBuffer } from "stream/consumers";
import { Axios } from "../../node_modules/axios/index";
interface signedUpload {
    bucketname : string,
    filetoupload : string
    filestream : ArrayBuffer
}
const axios = require('axios');
const qs = require('qs');
const test = {
    client_id : process.env.AUTODESK_CLIENT_ID,
    client_secret : process.env.AUTODESK_CLIENT_SECRET
}
const bucket = "daniel_viewer_testing";
export const createToken = async () => {
    // return fs.readFileSync('./src/services/token.txt').toString();
    let data = qs.stringify({
    'grant_type': 'client_credentials',
    'scope': 'viewables:read' 
    });
    data = qs.stringify({
        'grant_type': 'client_credentials',
        'scope': 'data:write data:read data:create bucket:create bucket:read viewables:read' 
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://developer.api.autodesk.com/authentication/v2/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Accept': 'application/json', 
            'Authorization': `Basic ${btoa(`${test.client_id}:${test.client_secret}`)}`
        },
        data : data
    };

    let req = await axios.request(config);
    // fs.writeFileSync('./src/services/token.txt',req.data.access_token);
    return req.data.access_token;

};

const uploadToken = async () => {
    return fs.readFileSync('./src/services/token.txt').toString(); 
    
    let data = qs.stringify({
    'grant_type': 'client_credentials',
    'scope': 'data:write data:read data:create bucket:create bucket:read viewables:read' 
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://developer.api.autodesk.com/authentication/v2/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Accept': 'application/json', 
            'Authorization': `Basic ${btoa(`${test.client_id}:${test.client_secret}`)}`
        },
        data : data
    };

    let req = await axios.request(config);
    // fs.writeFileSync('./src/services/token.txt',req.data.access_token);
    return req.data.access_token;

};

export const logout = async () =>{
    //local
    try {
        const response : { data : string } = await new Promise(resolve => {
            setTimeout(() => resolve({ data: 'Sample Data' }), 1000);
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export const createBucket = async () =>{
    //POST
    let url = "https://developer.api.autodesk.com/oss/v2/buckets";
    let payload = {
        "bucketKey": "daniel_viewer_testing",
        "policyKey": "persistent"
    }
}

export const uploadFile = async (props : signedUpload)=>{
    let body = Buffer.from(props.filestream);
    fs.writeFileSync('./tempfiles/' + props.filetoupload,body);
    let token = await uploadToken();
    fs.writeFileSync('./src/services//uploadtoken.txt',token);
    console.log("Creating upload link...")
    props.bucketname = "daniel_viewer_testing";
    let getsigned_url = `https://developer.api.autodesk.com/oss/v2/buckets/${props.bucketname}/objects/${props.filetoupload}/signeds3upload?minutesExpiration=60`
    let signed_url = await axios.get(getsigned_url,{
        headers: {
            Authorization : "Bearer " + token
        }
    });
    let returndata : returndata_type = {urn:"", msg : "",location:"",objectKey:""};
    let url = signed_url.data.urls[0];
    let uploadKey = signed_url.data.uploadKey;
    //test
    // let url = 'https://com-autodesk-oss-prodemea-direct-upload.s3-accelerate.amazonaws.com/68/38/6e/f3/bucket/daniel_viewer_testing/signed-url-uploads/68386ef3-9ee2-4c02-8582-5b4c0595d5c7?partNumber=1&uploadId=tCmjKi4X64pPbeU.CQ3UCqL8UD.pt2fiRRxoQyYqL.kCFvMNw1XNpL0l07yWxcFPsGEq3ahNmjHVDFfREN_rfrpMOkCRnB1IVNF.XuxHMdhv1Zbk7O0liA1gMtIOSou2FyT4yHHM8XwW42DsuX9EFntdSa3Uw_0KcMQ.VDR_1xTTdKSxy_GbVvunYnN7hxhXBTnESkZpVxjZsYdps70Dqg--&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEMaCWV1LXdlc3QtMSJHMEUCIQDb98jMgoti4OYMyT5nzygKoPqZiH1MvwHL%2B7aB4p17AQIgVyQ9FeD3xK2n7uVSmBFJnwqOwKyVnfXMOqvGPBhXx4IqxwIILBAFGgwxMTE4MTc4ODU5NjEiDO2yED5FZ91KEx2%2BZCqkAncAMrXuS0%2FsbcbRdiZUP7Z7k%2F9hKUsjXQ7MHMMxuZdPHW3J1FtuQ1cjV37PVyIe2LyvS3M3mRj4%2BHV5F0bPrOf1FSSpCzV51jsCOn0b%2FZnWqPdRzwbhSxLwH%2B7bsailX%2FLPVZG5KgdUmInY3uPWTMmf5li25ztBvSPgkvsFXaOEEB1onJqJ9p6QUSbIiIZaWaQxinCsNM8lPgee15s%2BOapcuShsPIrtqPlvtedYWWmswuy5NN1GC5NHqEQs2C5LNodyAPtx562qzOvvlNq7Rd%2BUgDz8CReyoEUXMpmdJjC%2F6PfMKze0W1Ew%2FDMxFKAFF3TtpzBDmz66vEG1QtIbfNNZn0BWeEdsv5KScwCn60kKWNYxPAWHSnEo8anXTGhXpgXDQUowkOudtQY6nQFFhWor9bk2ZzCwvliwk97i6eBIM2O9dGcjKaZz4RbbRT1fTUQ7WHtJ4njHAZLAMvbcv%2B92PiAulfG79owROoV6%2BvAgv82y6bGreUHOc%2BVhkyKSKj7bbST7WM%2FVNTcwC7TpFjs59hK1DqBn1JMCiLU1KDHmitbuDtDJD1D8wmhLi%2BbPkkEfa4fx0rWKY7%2FDD0Dt336FK0XrmV8InfzN&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240729T105755Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIARUCG5REESILGFB63%2F20240729%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Signature=7f1cf4d4f88c145ebe5945764bec736e1ae9e6fadbd21ca18df4f8daebbf0727'
    // let uploadKey = 'AQICAHiHL0jn8F1WQcYWeoGT1RToORUSY9GaGsgH2NYIIiqP-QGjEY9AxcU3VxLga4kKFEFcAAACBzCCAgMGCSqGSIb3DQEHBqCCAfQwggHwAgEAMIIB6QYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAy-TzqzxruPPO_Ed78CARCAggG6f87XDLCvVzSFazlABrEPXfOHJ4drqhsJ0v7VqS9gTzRwTJ9cznc3M_axYCsJBiGEpWknBh1e3DpvJY5pa_FI0PAwksYLHy6YTyLlCFWBYR42w8EMnTBZRBg1XwnUQL3QpOghlexKLFcPtfJIvoJ98G4cG8c7bcnABEDiJ00_nb5JmVlgwhAyXLCKIaou2D9hSkOjjq2Hwn3dy_hwSq8tZRX4J8MTBozNGwo8hMOHu-SmnPGm02ZvdOsRwQqsXVCqSU5C9GuNsuNFVD0f_M-Ujx0uZ5UmjtQufsJIMBfl5gtYu_aC-ouuDXeTCgTaGg1FjhwAIbb-kHUAJg9DC-yEuwyHXy01PZyhGbZTydYsCx1LLJ4pmiTQN4vaXFU2kwiK2HKmq41RDXV1yOVKpYrjne2iHdHdJyUSA_4eXFoy24joxd0lzaHeqI3mwqmxoayBU3c8jjCjLFqAIbaYkNR-RCiX-W9fot8psccwoxOVjbi_ZeGHEzl-6FMH37HQgeL32nMmcfI1qMCEW45wCD9pDl3w9GpPxGsC4AASZ5SSNXg_-mziHZlYFcTJecYaC52n3Bsw2rcnu6qoPQ==';
    //test

    //PUT
    console.log('uploading to autodesk...')
    try{
        let config =  {
            method: 'PUT',
            maxBodyLength: Infinity,
            url : url,
            headers: { 
                'Content-Type': 'application/octet-stream',
            },
            data : fs.readFileSync('./tempfiles/' + props.filetoupload)
        };
        let response = await axios.request(config)
        if(response.status != 200){
            throw "Error occured while uploading to autodesk";
        }
    }catch(ex){
        console.log(ex)
        return {msg :  "Error uploading to autodesk", urn :''}
    }

    //POST
    console.log("finalizing...")
    let finalize_url = `https://developer.api.autodesk.com/oss/v2/buckets/${props.bucketname}/objects/${encodeURI(props.filetoupload)}/signeds3upload`
    let finalize_payload = {
        "ossbucketKey": props.bucketname,
        "ossSourceFileObjectKey": props.filetoupload,
        "access": "full",
        "uploadKey": uploadKey
    }
    let item_info;
    try{
    let config =  {
        method: 'POST',
        maxBodyLength: Infinity,
        url : finalize_url,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        data : JSON.stringify(finalize_payload)
    }
    let finalize_req = await axios.request(config);
    
    if(finalize_req.status != 200){
        throw "Error finalizing"
    }

    item_info =  finalize_req.data;
    }catch(ex){
        console.log(ex)
        return {msg :  "Error uploading to autodesk", urn :''}
    }

    //POST
    console.log("Converting to SVF...");
    
    try{
        let convert_url = "https://developer.api.autodesk.com/modelderivative/v2/designdata/job";
        let convert_payload = {
            "input": {
                "urn": btoa(item_info.objectId),
                "compressedUrn": false
            },
            "output": {
                "formats": [
                    {
                        "type": "svf",
                        "views": [
                            "2d",
                            "3d"
                        ]
                    }
                ]
            }
        }
        let config =  {
            method: 'POST',
            url : convert_url,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            data : JSON.stringify(convert_payload)
        }
        let convert_response = await axios.request(config);
        returndata.urn = convert_response.data.urn;
        

    }catch(ex){
        console.log(ex);
        return { msg : "Error converting", urn :'' }
    }
    let reconnect = 0;
    try{
        let checksuccess : boolean = true;
        while(checksuccess){
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('Checking status attempt #',reconnect+1)
            let config =  {
                method: 'GET',
                url : `https://developer.api.autodesk.com/modelderivative/v2/designdata/${returndata.urn}/manifest`,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            let checkres = await axios.request(config);
            if(checkres.data.status == "success"){
                console.log('Converted')
                checksuccess = false;
            }else if(checkres.data.status == "failed" || checkres.data.status == "timeout"){
                checksuccess = false;
                returndata["msg"] = "Failed to convert"
                return returndata;
            }

            if(reconnect == 8){
              checksuccess = false;
            }
            reconnect++;
        }
    }catch(ex){

    }
    returndata["msg"] = "OK";
    return returndata;
}
function bufferToStream(buffer: Buffer): Readable {
    return new Readable({
      read() {
        this.push(buffer);
        this.push(null); // No more data
      }
    });
  }
export const convertSV2 = async ()=>{
    //POST
    let url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/job`;
}


