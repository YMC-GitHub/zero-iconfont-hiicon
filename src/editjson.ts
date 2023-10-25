

import { writeFileSync,existsSync ,mkdirSync,readFileSync} from 'fs'
import { dirname,resolve} from 'path'

function noop() {}
export function writeJsonFileSync(loc:string, data:any) {
    try {
        let tmp = data
        if (typeof data !== 'string') {
            tmp = JSON.stringify(data, null, 2)
        }
        writeTextFileSync(loc, tmp)
    } catch (error) {
        noop()
    }
}

// export util for sharing to other files or package
// when they are too much, move them to anoter file or package
export function writeTextFileSync(loc:string,text=''){
    makedirs(loc)
    // log(`[info] out: ${loc}`)
    writeFileSync(loc,text)
}
export function makedirs(loc:string){
    let dir = dirname(resolve(loc))
    if(!existsSync(dir)) mkdirSync(dir,{recursive:true})
}


export function readJsonFileSync(loc:string,defaultText='{}'){
    return JSON.parse(readTextFileSync(loc,defaultText))
}

export function readTextFileSync(loc:string,defaultText=''){
    let text = ''
    try {
        text = readFileSync(loc).toString()
    } catch (error) {
        text = defaultText
    }
    return text
}

// editjson-transform-sortkeys
export function sortJsonByKeys(json:any,keys:string){
    // str-to-arr,trim,no-empty
    let arr = keys.split(',')
    arr=arr.map(v=>v.trim()).filter(v=>v)

    let otherkeys = Object.keys(json).filter(a=>!arr.includes(a))
    let res:any={}
    res=assignValueByKey(res,arr,json)
    res=assignValueByKey(res,otherkeys,json)
    return res
}
function assignValueByKey(res:any,arr:string[],json:any){
    for (let index = 0; index < arr.length; index++) {
        let key = arr[index]
        res[key]=json[key]  
    }
    return res     
}

// editjson-plugin-pickkeys
export function selectValueByKeys(json:any,keys:string){
    // str-to-arr,trim,no-empty
    let arr = keys.split(',')
    arr=arr.map(v=>v.trim()).filter(v=>v)

    let res:any={}
    for (let index = 0; index < arr.length; index++) {
        let key = arr[index]
        res[key]=json[key]  
    }
    return res
}


// editjson-transform-keywrods
export interface EditKeywordOption {
    include:string,
    exclude:string,
    sep:string,
    ns:string
}
export type EditKeywordOptionLike = Partial<EditKeywordOption>
const builtinEditKeywordOption = {include:'',exclude:'',sep:',',ns:'keywords'} 
export function editKeywords(data:any,opts?:EditKeywordOptionLike){
    let buitinOption:EditKeywordOption = builtinEditKeywordOption
    let option =opts? {...buitinOption,...opts}:buitinOption
    let {include,exclude,sep,ns}=option
    let dataInNs=data[ns]
    let res:string[]=dataInNs?dataInNs:[]
    res=kwInclude(res,kwArrify(include,sep))
    res=kwExclude(res,kwArrify(exclude,sep))
    res=kwDup(res)
    // update to data
    data[ns]=res
    // return {keywords:res,json:data}
    return res
}

function kwArrify(s:string,sep:string=','){
    return s.split(sep)
}
function kwInclude(cur:string[],toadd:string[]){
    return [...cur,...toadd]
}
function kwExclude(cur:string[],todel:string[]){
    return cur.filter(v=>!todel.includes(v))
}
function kwDup(cur:string[]){
    return Array.from(new Set([...cur]))
}