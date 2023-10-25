import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import parse from "./nano-args"
import type {NanoArgsData} from "./nano-args"

import { getFileList } from './file-list'
import {getFileSize,toKeyValTree,toMarkdownTable,writeMarkdownFile} from "./file-size"

import {loadTextFile,toFontCssCdn,parseGithubUrl,getCdnJsdelivrUrl} from "./cdn"
import {touch} from "./touch"
import {readJsonFileSync,writeJsonFileSync,sortJsonByKeys,editKeywords,editName,editRepo} from "./editjson"



const {log}=console
function doNothing(){

}
function runasync(main:Function){
    return main().then(doNothing).catch(doNothing)
}

function valIsOneOfList(val: any, list:any[]) {
    return list.includes(val)
}

function cmdListify(cmd:string){
    return cmd.split(",").map(v=>v.trim()).filter(v=>v)
}
// mock path.join
function join(...pathLike:string[]){
    return pathLike.join('/').replace(/\/{2,}/,'/')
}


interface CliGetCmdOption {
    name:string,
    mode:'flags-important'|'_-important',
    // cmd in the _ index
    index:number
}
type CliGetCmdOptionLike = Partial<CliGetCmdOption>

function cliGetCmd(data:NanoArgsData,opts?:CliGetCmdOptionLike,def:string=''){
    let cmd = cliGetValue(data,opts)
    let res:string=''
    // ensure string and avoid undefined
    res= cmd!==undefined?cmd.toString():''
    // use the default value 
    res= res?res:def
    return res
}

// -w,--workspace -> [s,l]
function cliGetPureName(name:string){
    let [sl] = name.trim().split(" ")
    let [s,l] = sl.split(",").map(v=>v.trim().replace(/^-+/,'')).filter(v=>v)
    return [s,l].join(",")
}

// cliGetValueByName({flags:{w:true}},'-w') -> true
// cliGetValueByName({flags:{w:true}},'-w,--workspace') -> true
function cliGetValueByName(data:NanoArgsData,name:string){
    let pname = cliGetPureName(name).split(",")
    let  {flags,_,extras} =data
    let res
    for (let index = 0; index < pname.length; index++) {
        const pni = pname[index];
        if(pni in flags){
            res=flags[pni]
            break;
        }
    }
   return res
}

function cliGetValue(data:NanoArgsData,opts?:CliGetCmdOptionLike,def?:any){

    let buitinOption:CliGetCmdOption = {name:'cmd',mode:'flags-important',index:0}
    let option =opts? {...buitinOption,...opts}:buitinOption

    let res:string =''

    let  {flags,_,extras} =data
    // use the first value in _ as cmd 
    // 'ns file-size' -> 'file-size'
    // let [cmd] = _
    // use the index value in _ as cmd ,when index is < 0, means that not use index
    let cmd =option.index<0?undefined: _[option.index]

    // use the cmd in flags 
    // 'ns --cmd file-size' -> 'file-size'
    let cmdInOption = cliGetValueByName(data,option.name)

    // use cmd in _ or use cmd in flags ?
    if(option.mode ==='_-important'){
        cmd = (cmd!=undefined && cmdInOption)?cmdInOption : cmd; //cmd in _  important!
    }
    if(option.mode ==='flags-important'){
        cmd = cmdInOption!=undefined?cmdInOption : cmd; //cmd in flags important!
    }

    // ensure string and avoid undefined
    // res= cmd?cmd.toString():''
    // use the default value 
    // res= res?res:def

    cmd = cmd !=undefined?cmd:def
    return cmd
}


function decodeJSON(a:any){
    return JSON.stringify(a,null,0)
}

function delstrPrefix(str:string, flag:boolean, prefix:string) {
    str = flag ? str.replace(new RegExp(`^${prefix}`, 'ig'), '') : str
    return str
}

// 'ab' -> 'an/'
function  ensureEndsWith(s:string,sep:string='/'){
    return s.endsWith(sep)?s:`${s}${sep}`
}

// '/a/b' -> '/a/b/' or '\\a\\b' -> '\\a\\b\\'
function autoEndsWithSep(s:string){
    let backSlash='\\'
    let backSlashInS = s.indexOf(backSlash)
    
    // back slash first
    if(backSlashInS>=0){
        ensureEndsWith(s,backSlash)
    }else{
        ensureEndsWith(s,'/')
    }
}
function getValue(s:any,def:any=''){
    return s?s:def
}
async function main(){
    log(`[zero] hello, zero!`)


    // log(`[debug] nano  parse:`)
    let input = process.argv.slice(2);
    log(`[info] cli input`,decodeJSON(input));
    let cliArgs = parse(input);
    // let {flags,_,extras} =cliArgs;log(flags,_,extras);

    log(`[info] nano parse result`,decodeJSON(cliArgs))

    // get cmd
    let cmd = cliGetCmd(cliArgs,{name:'cmd',index:0,mode:'flags-important'})
    
    if(valIsOneOfList(cmd,cmdListify('touch,add-txt-file'))){
        // get working dir
        let wkd:string=''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs,{name:'wkd',index:-1,mode:'flags-important'})
        wkd=getValue(wkdInCmd,'./')
        log(`[${cmd}] workspace: ${wkd}`)

        // supoort touch --file xx and compact with touch xx
        let file = cliGetCmd(cliArgs,{name:'file',index:1,mode:'flags-important'})
        file=getValue(file,'')
        log(`[${cmd}] touch ${file}`)
        touch(file)
    }

    if(valIsOneOfList(cmd,cmdListify('sortjsonkey,sjkey'))){
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs,{name:'w,workspace',index:1,mode:'flags-important'},'./')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx and compact with sortjsonkey xx
        let file = cliGetCmd(cliArgs,{name:'file',index:-1,mode:'flags-important'},'package.json')

        let location:string = join(ws,file)

        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)
        log(`[${cmd}] list json keys : ${Object.keys(data)}`)
        data=sortJsonByKeys(data,`name,version,description,author,license,bugs,homepage,devDependencies`)
        // name,version,description,main,devDependencies,scripts,repository,keywords,author,license,bugs,homepage
        writeJsonFileSync(location,data)
        //
    }

    if(valIsOneOfList(cmd,cmdListify('edit-keywords'))){
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs,{name:'w,workspace',index:1,mode:'flags-important'},'./')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs,{name:'file',index:-1,mode:'flags-important'},'package.json')

        let location:string = join(ws,file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --include a,d
        let include = cliGetCmd(cliArgs,{name:'include',index:-1,mode:'flags-important'},'')
        // supoort sortjsonkey --exclude a,b,c,d
        let exclude = cliGetCmd(cliArgs,{name:'exclude',index:-1,mode:'flags-important'},'')
        // supoort sortjsonkey --sep ,
        let sep = cliGetCmd(cliArgs,{name:'sep',index:-1,mode:'flags-important'},',')
        // supoort sortjsonkey --ns keywords
        let ns = cliGetCmd(cliArgs,{name:'ns',index:-1,mode:'flags-important'},'keywords')

        editKeywords(data,{include,exclude,sep,ns})
        writeJsonFileSync(location,data)
    }

    if(valIsOneOfList(cmd,cmdListify('edit-name'))){
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs,{name:'w,workspace',index:1,mode:'flags-important'},'./')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs,{name:'file',index:-1,mode:'flags-important'},'package.json')

        let location:string = join(ws,file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let ns = cliGetCmd(cliArgs,{name:'--ns',index:-1,mode:'flags-important'},'name')
        let org = cliGetCmd(cliArgs,{name:'-o,--org',index:-1,mode:'flags-important'},'')
        let name = cliGetCmd(cliArgs,{name:'-n,--name',index:-1,mode:'flags-important'},'')
        editName(data,{ns,name,org})
        writeJsonFileSync(location,data)
    }


    if(valIsOneOfList(cmd,cmdListify('edit-bool'))){
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs,{name:'w,workspace',index:1,mode:'flags-important'},'./')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs,{name:'file',index:-1,mode:'flags-important'},'package.json')

        let location:string = join(ws,file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let name = cliGetCmd(cliArgs,{name:'-n,--name',index:-1,mode:'flags-important'},'private')
        let value = cliGetValue(cliArgs,{name:'-v,--value',index:-1,mode:'flags-important'})

        log([name,value])
        if(value !==undefined){
            data[name]=value
        }
        writeJsonFileSync(location,data)
    }

    // editRepo
    if(valIsOneOfList(cmd,cmdListify('edit-repo'))){
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs,{name:'w,workspace',index:1,mode:'flags-important'},'./')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs,{name:'file',index:-1,mode:'flags-important'},'package.json')

        let location:string = join(ws,file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let user = cliGetCmd(cliArgs,{name:'-u,--user',index:-1,mode:'flags-important'},'ymc-github')
        let repo = cliGetCmd(cliArgs,{name:'-r,--repo',index:-1,mode:'flags-important'},'noop')
        let mono = cliGetValue(cliArgs,{name:'-m,--mono',index:-1,mode:'flags-important'})
        let packageLoc = cliGetCmd(cliArgs,{name:'-l,--packageLoc',index:-1,mode:'flags-important'})
        let branch = cliGetCmd(cliArgs,{name:'-b,--branch',index:-1,mode:'flags-important'})
        let name = cliGetCmd(cliArgs,{name:'-n,--name',index:-1,mode:'flags-important'},'')
        log([packageLoc])
        editRepo(data,{user,repo,mono:mono?true:false,name,packageLoc,branch})
        writeJsonFileSync(location,data)
    }


    if(valIsOneOfList(cmd,cmdListify('file-size,2'))){
        // file-zise ./packages/jcm
        log(`[file-size] get file size`)

        let wkd = './'
        let wkdInCmd = cliGetCmd(cliArgs,{name:'wkd',index:1,mode:'flags-important'})
        wkd=wkdInCmd?wkdInCmd:wkd
        // log(`[file-size] workspace: ${wkdInCmd}`)

        log(`[file-size] workspace: ${wkd}`)

        // log(`[file-size] file list`)
        // --dirs lib
        let inDirs = cliGetCmd(cliArgs,{name:'dirs',index:1,mode:'flags-important'})
        inDirs=getValue(inDirs,'lib|dist|bin')
        // --ext
        let rule = cliGetCmd(cliArgs,{name:'ext',index:1,mode:'flags-important'})
        rule=getValue(rule,'.js$')
        
        let files = getFileList(inDirs,{wkd:wkd,macthRules:[new RegExp(rule)]})
        log(files)

        log(`[file-size] size of file list`)
        let fsdList = files.map(file=>{
            // let 
            let fsd = getFileSize(file.name)
            // fsd[0] = delstrPrefix(fsd[0], true,ensureEndsWith(wkd,'/'))
            return fsd
        })
        // log(fsdList)

        // let fsdkvList = fsdList.map(fsd=>toKeyValTree(fsd))
        // log(`[file-size] to key value tree:`)
        // log(fsdkvList)

        let markdownTable = toMarkdownTable(fsdList)
        // log(`[file-size] markdown table of file size: \n`)
        log(markdownTable)
        // log(`[file-size] write to markdown file: \n`)
        writeMarkdownFile({text:markdownTable,wkd:ensureEndsWith(wkd,'/')})

    }


    if(valIsOneOfList(cmd,cmdListify('css-cdn'))){
        log(`[css-cdn] get cdn for iconfont.css`)

        let wkd = './'
        let wkdInCmd = cliGetCmd(cliArgs,{name:'wkd',index:1,mode:'flags-important'})
        wkd=wkdInCmd?wkdInCmd:wkd
        // log(`[file-size] workspace: ${wkdInCmd}`)

        let text :string=''
      

        text=loadTextFile(`fonts/iconfont.css`)
        // // todo: slice @font-face  { xxx }
        let cdncss:string=''

        // cdncss=toFontCssCdn({text,cdn:'//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.'})
        cdncss=toFontCssCdn({text,cdn:'//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/fonts/iconfont.'})
        log(cdncss)

        // https://juejin.cn/post/6844903758942453768
        // log(cdncss.match(/@font-face \{(\n|.)*/im))

        let url :string = ''
        let data =parseGithubUrl('https://github.com/YMC-GitHub/zero-iconfont-hiicon/blob/main/fonts/iconfont.css')
        log(`[info] jsdelivr & github: `,getCdnJsdelivrUrl(data))
        // log(`[info] jsdelivr & npm:`)
        // log(getCdnJsdelivrUrl([...data.slice(0,4),'npm']))

        log(`[info] staticaly & github: `,getCdnJsdelivrUrl(data,'//cdn.staticaly.com'))
        // log(`[info] staticaly & npm:`)
        // log(getCdnJsdelivrUrl([...data.slice(0,4),'npm'],'//cdn.staticaly.com'))
    }

    // todo: fetch svg file to collect *.svg files saving in <root>/svg dir
    //svg-fetch
    // https://www.w3schools.com/icons/google_icons_action.asp
    // https://github.com/FortAwesome/Font-Awesome/blob/6.x/svgs/regular/window-restore.svg

    // https://www.npmjs.com/search?q=stream%20fetch
    // todo: fetch data from remote with stream
    // pnpm add  meros


}
runasync(main)

// tsx ./src/cli.ts 0 00 00 
// tsx ./src/cli.ts file-zise --cmd file-size
// tsx ./src/cli.ts file-zise ./packages/jcm

// tsx ./src/cli.ts css-cdn