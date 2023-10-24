import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'

import parse from "./nano-args"
import { getFileList } from './file-list'
import {getFileSize,toKeyValTree,toMarkdownTable,writeMarkdownFile} from "./file-size"

import type {NanoArgsData} from "./nano-args"


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

interface CliGetCmdOption {
    name:string,
    mode:'flags-important'|'_-important',
    // cmd in the _ index
    index:number
}
type CliGetCmdOptionLike = Partial<CliGetCmdOption>

function cliGetCmd(data:NanoArgsData,opts?:CliGetCmdOptionLike):string{

    let buitinOption:CliGetCmdOption = {name:'cmd',mode:'flags-important',index:0}
    let option =opts? {...buitinOption,...opts}:buitinOption

    let res:string =''

    let  {flags,_,extras} =data
    // use the first value in _ as cmd 
    // 'ns file-size' -> 'file-size'
    // let [cmd] = _
    // use the index value in _ as cmd 
    let cmd = _[option.index]

    // use the cmd in flags 
    // 'ns --cmd file-size' -> 'file-size'
    let cmdInOption = flags[option.name?option.name:'cmd']

    // use cmd in _ or use cmd in flags ?
    if(option.mode ==='_-important'){
        cmd = (!cmd && cmdInOption)?cmdInOption : cmd; //cmd in _  important!
    }
    if(option.mode ==='flags-important'){
        cmd = cmdInOption?cmdInOption : cmd; //cmd in flags important!
    }
    // ensure string and avoid undefined
    res= cmd?cmd.toString():''
    return res
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

    let cmd = cliGetCmd(cliArgs)
    

    

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

}
runasync(main)

// tsx ./src/cli.ts 0 00 00 
// tsx ./src/cli.ts file-zise --cmd file-size
// tsx ./src/cli.ts file-zise ./packages/jcm