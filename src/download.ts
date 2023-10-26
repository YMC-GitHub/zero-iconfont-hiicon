
import { createWriteStream,writeFileSync,existsSync ,mkdirSync,readFileSync} from 'fs'
import { dirname,resolve} from 'path'
import type {WriteStream} from 'node:fs'

// export type Arrayable<T> = T | ReadonlyArray<T>;
// import type { Readable } from 'node:stream';
import { request as httpsRequest } from 'https'
const {log}=console

export interface DonwloadOption {
    url:string,
    targetFile?:string,
    overideTargetFile?:boolean,
    showProgress?:boolean,
    customRequest?:()=>{},
    data?:any //request data
}
export type DonwloadOptionLike = Partial<DonwloadOption>
const builtinDownloadOption:DonwloadOption = {url:'',showProgress:true}

interface HttpReqOption {
    data?:any
}

interface TargetItem {
    url:string,
    name:string,
    file:string
}
 
// tsx src/stream-fetch.ts

export async function downloadFile(url:string,options?:string|DonwloadOptionLike) {
    let option:DonwloadOption
    if(options){
        if( typeof options === 'string'){
            // feat: downloadFile(url,targetFile)
            option={ targetFile: options,url }
        }else{
            // feat: downloadFile(url,option)
            option={...options,url}
        }
    }else{
        // feat: downloadFile(url)
        option={url}
    }
    option= {...builtinDownloadOption,...option}

    const { targetFile, overideTargetFile } = option
    // desc: save file when option.targetFile and option.overideTargetFile
    // feat: save target file or not
    // feat: overide target file or not
    // log(JSON.stringify(option,null,0),overideTargetFile,!overideTargetFile)
    if ((overideTargetFile==false) && targetFile!==undefined && existsSync(targetFile)) {
        log(`[info] target file ${targetFile} exsits`)
        return
    }

    // desc: set path param (todo)

    // desc: set headers (todo)

    return await new Promise((resolve, reject) => {
        let request = httpsRequest
        // if (isFunction(option.customRequest)) {
        //     request = option.customRequest
        // }
        // request(url, cb)
        // request(url, option,cb)
        // request(option,cb)
        // log(option,url)
        // process.exit(0)
        // @ts-ignore
        const req = request(url, option, response => {
            // log(option)
            const code = response.statusCode ?? 0
            // log(code, response.statusMessage);
            if (code >= 400) {
                // feat: info reponse code and msg when 4xx
                log('[info] get response state')
                // log(response)
                log(code, response.statusMessage)

                // method,path,host,protocol
                return reject(new Error(response.statusMessage))
            }
            // Error: Not Found

            // feat: handle redirects when code is 3xx
            if (code > 300 && code < 400 && !!response.headers.location) {
                return downloadFile(response.headers.location, targetFile)
            }

            const progressOption = initProgressState({
                len: parseInt(response.headers['content-length'] || '0', 10),
                file: targetFile || response.url
            })

            let data = ''
            // desc: show progress when reponse recive data
            response.on('data', chunk => {
                calcProgressState(progressOption, chunk)
                // cur += chunk.length;
                option.showProgress && showProgress(progressOption)
                data += chunk
            })

            // desc: show donwload complete msg when reponse recive data success
            // desc: reslove data when reponse recive data success + not save to file
            response.on('end', () => {
                option.showProgress && log('[progress] download complete')
                if (!targetFile) {
                    resolve(data)
                }
            })

            // feat: save file to disk through stream
            if (targetFile) {
                saveFileThroughStream({
                    targetFile,
                    resolve,
                    response,
                    data
                })
            }
        }).on('error', error => {
            reject(error)
        })

        // feat: support body parameters\n\nwith option.data when option.Method is POST,PUT,PATCH
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
        if (option.data) {
            req.write(option.data)
        }
        req.end()
    })
}
function isString(s:any) {
    return typeof s === 'string'
}
function isFunction(s:any) {
    return typeof s === 'function'
}



export interface ProgessOption {
    file:string,
    cur:number,
    len:number,
    total:number,
 }
 export type ProgressOptionLike = Partial<ProgessOption>
 const builtinProgressOption = {file:'',cur:0,len:0,total:0}
 
 // export function caclProgressMsg(file:string, cur:number, len:number, total:number) {
 //     const progress = ((100.0 * cur) / len).toFixed(2)
 //     const downloadedSize = (cur / 1048576).toFixed(2)
 //     // const totalSize = len === 1 ? downloadedSize : total.toFixed(2)
 //     const totalSize = total.toFixed(2)
 //     const msg = `[progress] downloading ${file} - ${progress} % (${downloadedSize} MB ) of total size: ${totalSize}MB`
 //     return msg
 // }
 
 export interface ProgessMsgData {
     progress:string,
     downloadedSize:string,
     totalSize:string,
     unit:string,
 }
 export function caclProgressMsg(option:ProgessOption) {
     const { file, cur, len, total } = option
     let [unit,unitLimited] = nearProgressUnit(option)
     // unitLimited=1048576
     let floatcount=0;
     const progress = ((100.0 * cur) / len).toFixed(floatcount)
     // const downloadedSize = (cur / unitLimited).toFixed(floatcount)
     const downloadedSize = cur.toFixed(floatcount)
 
     // const totalSize = len === 1 ? downloadedSize : total.toFixed(2)
     const totalSize =(total==0? len:total).toFixed(floatcount)
 
     // const msg = `[progress] downloading to ${file} - ${progress} % (${downloadedSize} ${unit} ) of total size: ${totalSize}${unit}`
     let res:ProgessMsgData={progress,downloadedSize,totalSize,unit}
     return res
 }
 
 export function showProgress(option:ProgessOption) {
     // const { file, cur, len, total } = option
     let msgData = caclProgressMsg(option)
     // log(msgData)
     const { file, cur, len, total } = option
     const {progress,downloadedSize,totalSize,unit} = msgData
     const msg = `[progress] downloading to ${file} - ${progress} % (${downloadedSize} ${unit} ) of total size: ${totalSize} ${unit}`
     // log(JSON.stringify(option,null,0))
     log(msg)
     return msgData
 }
 
 export function initProgressState(opts:ProgressOptionLike) {
     let state:ProgessOption  = {...builtinProgressOption,...opts}
     // const len = parseInt(response.headers["content-length"], 10);
     // state.total = state.len / 1048576 // 1048576 - bytes in 1 Megabyte
     
     return state
 }
 
 /* eslint-disable no-param-reassign */
 export function calcProgressState(option:ProgessOption, chunk:string) {
     option.cur += chunk.length
     option.total = option.total ==0?option.len:option.total 
     return option
 }
 /* eslint-enable no-param-reassign */
 
 
 // b,kb,mb,gb
 // log(1*1024*1024*1024)
 type unitKeyValPairs = [string,number]
 export function nearProgressUnit(option:ProgessOption){
     const {total } = option
     let res:unitKeyValPairs=["b",1024]
     let map :unitKeyValPairs[]=[["b",1024],["kb",1048576],["mb",1073741824]]
     
     for (let index = 0; index < map.length; index++) {
         const kv = map[index];
         if(total<=kv[1]){
             res=kv
             break
         }
     }
     return res
 }



 export interface SaveFileStreamOption {
    response:any,
    targetFile:string,
    stream?:WriteStream,
    resolve:(value: unknown) => void
    data:string
 }
 export type SaveFileStreamOptionLike = Partial<SaveFileStreamOption>
 

export function saveFileThroughStream(option:SaveFileStreamOption) {
    const { response, data, stream, targetFile, resolve } = option
    let fileWriter =  stream?stream:_createWriteStream(targetFile)
    // tech: use eventemitter & promise & stream
    fileWriter.on('finish', () => {
        // resolve({})
        // desc: reslove data when reponse finish saving to file
        resolve(data)
    })
    response.pipe(fileWriter)
}

export function makedirs(loc:string){
    let dir = dirname(resolve(loc))
    if(!existsSync(dir)) mkdirSync(dir,{recursive:true})
}

function _createWriteStream(location:string){
    // enusre path exits 
    makedirs(location)
    return createWriteStream(location)
}

function promise(value:any){
    // promise this value
    return Promise.resolve(value)
}


// tsx src/download.ts