
async function main(){
    const fs = await import("fs");
    let files = fs.readdirSync('./public');
    var filename_list = {}
    try{
        filename_list = JSON.parse(fs.readFileSync('./tempfiles/filename_list.json').toString())
    }catch(ex){}
    var issue_list = fs.readFileSync('./tempfiles/issue.txt').toString();

    for(let i=0;i<files.length;i++){
        let file=files[i];
        if(!file.includes('.csv')){continue}
        let filedata = fs.readFileSync('./public/' + file).toString().split('\r\n');
        let headers = filedata[0].split(',');
        let keyword = headers.indexOf("Name");
        let write_count = 0;
        for(let j=1;j<filedata.length;j++){
            let csv = filedata[j].split(',');
            if(csv[keyword] == undefined){continue}
            if(filename_list[csv[keyword]] != undefined){console.log('done',csv[keyword]);continue}
            if(issue_list.includes(csv[keyword])){console.log('issue',csv[keyword]);continue}
            
            console.log('searching...',csv[keyword])
            await searchFile({filename:csv[keyword]}).then(async(data)=>{
                if(data.data.length == 1){
                    console.log(data.data[0].url)
                    filename_list[csv[keyword]] = data.data[0];
                    write_count++;
                    if(write_count > 5){
                        fs.writeFileSync('./tempfiles/filename_list.json',JSON.stringify(filename_list,undefined,4))
                        write_count = 0;
                    }
                }else{
                    fs.appendFileSync('./tempfiles/issue.txt',`${csv[keyword]},${data.data.length}\r\n`)
                }
            })
        }
        // continue;
    }
}
async function searchFile(props){
    console.log('searching',props.filename)
    let url = "https://cof-dev.emerson.com/apps/cad_api/api/drawing3d/v1/get-list";
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
main();