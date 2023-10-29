// pnpm add -DW  fs-extra chalk brotli execa

// import { readFileSync } from 'fs-extra'

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync,mkdirSync } from 'fs'
import { dirname,resolve,join} from 'path'

import { gzipSync } from 'zlib'
import { compress } from 'brotli'

// pnpm add brotli ; pnpm add -D @types/brotli

const { log } = console


export interface FileSizeData {
    name:string,
    size:string,
    gzipSize:string,
    compressSize:string
}

export function toKeyValTree(data:string[]){
    // string[] -> key-value pairs obj
    let [name,size,gzipSize,compressSize] = data
    return {name,size,gzipSize,compressSize}
}

export function getFileSize(file:string) {
    // if (!file) return
    const f = readFileSync(file)
    const minSize = size2kb(f.length)
    const gzipped = gzipSync(f)
    const gzippedSize = size2kb(gzipped.length)
    const compressed = compress(f)
    const compressedSize = size2kb(compressed.length)
    return [file, minSize, gzippedSize, compressedSize]
}

export type SizeUnit = 'b'|'kb'|'mb'|'gb'
function size2kb(size:number,unit:SizeUnit='kb'){
    let num
    switch (unit) {
        case 'kb':
            num= (size/1024).toFixed(2)
            break;
        case 'mb':
            num= (size/1024/1024).toFixed(2)
            break;
        case 'gb':
                num= (size/1024/1024/1024).toFixed(2)
                break;
        default:
            num= size.toFixed(2)
            break;
    }
    return [num,unit].join('')
}

// about concept of transform,plugin,preset,config for file-size ?
// file-size/plugins/markdown -- fileSizeDataList to markdown table 

function toMarkdownTableBody(data:string[]) {
    // let [file, minSize, gzippedSize, compressedSize] = data;
    // return `${file} | ${minSize} | ${gzippedSize} | ${compressedSize}`;
    return data.join(' | ')
}
function toMarkdownTableHeader(body:string) {
    return `
file | size | gzip | brotli
:---- | :---- | :---- | :----
${body}
`.trim()
}

// handle fileSizeDataList -> markdownTable
export function toMarkdownTable(fileSizeDataList:string[][]){
    let body = fileSizeDataList.map(data => toMarkdownTableBody(data)).join('\n')
    let table = toMarkdownTableHeader(body)
    return table
}

// write markdownTable to lib-size.tmp.md'
export function writeTempfile( text:string,wkd = './',name='lib-size.tmp.md') {
    if (!text) return
    // ensure not ends with '/'
    let des = wkd.replace(/\/*$/,'')
    const file = {
        // join(wkd,name) => `${des}/${name}`
        name: `${des}/${name}`,
        data: text
    }
    // log(`[info] temp file: ${file.name}`)
    saveTextFile(file.name, file.data)
}


function loadTextFile(loc:string,defaultText=''){
    let text = ''
    try {
        text = readFileSync(loc).toString()
    } catch (error) {
        text = defaultText
    }
    return text
}
function saveTextFile(loc:string,text=''){
    makedirs(loc)
    log(`[info] out: ${loc}`)
    writeFileSync(loc,text)
}
function makedirs(loc:string){
    let dir = dirname(resolve(loc))
    if(!existsSync(dir)) mkdirSync(dir,{recursive:true})
}


// insert markdownTable to README.md'
function insertReadme(info:string, wkd = '.') {
    if (!info) return

    // read readme
    let text =loadReadme(wkd)

    // locate {{LIB_SIZE_INFO}} in readme.md
    const labelName = 'LIB_SIZE_INFO'
    
    const labeReg = new RegExp(`\\{\\{${labelName}\\}\\}`, 'ig')
    // log(labeReg)

    const label = labeReg.test(text)

    if (label) {
        text = text.replace(labeReg, info)
    } else {
        text=getLibSizeMarkdownTemplate(text)
        // join text and info
        // text=`${text}\n${info}`

        // replace text with info
        text = text.replace(labeReg, info)
    }
    // log(text)
    writeReadme(wkd,text)
}
function loadReadme(wkd:string,text=''){
    return loadTextFile([wkd,`README.md`].join('/'),text)
}
function writeReadme(wkd:string,text=''){
    return saveTextFile([wkd,`README.md`].join('/'), text)
}

function excapeRegExpChar (s:string){
    // excape { and }
    return s.replace(/({|})/gi, '\\\\$&')
} 

// const customTagS = excapeRegExpChar('{{')
// const customTagE = excapeRegExpChar('}}')
// const defineTag = (name:string, s:string, e:string) => new RegExp(`${s}${name}${e}`, 'ig')


function getTagReg (name:string, s:string, e:string) {
    return new RegExp(`${excapeRegExpChar(s)}${name}${excapeRegExpChar(e)}`, 'ig')
}

function getLibSizeMarkdownTemplate(head:string='',tail:string=''){
    let text= `
## lib size  
{{LIB_SIZE_INFO}}
`.trim()
    return [head,text,tail].filter(v=>v).join(`\n`)
}


export interface WriteMarkdownFileOpion {
    text:string,
    wkd:string,
    mode:'insert-to-readme'|'to-temp-file'
}
export type WriteMarkdownFileOpionLike = Partial<WriteMarkdownFileOpion>

export function writeMarkdownFile(opts?:WriteMarkdownFileOpionLike) {
    let buitinOption:WriteMarkdownFileOpion = {text:'',wkd:'./',mode:'to-temp-file'}
    let option =opts? {...buitinOption,...opts}:buitinOption
    const { text, wkd } = option
    log(`[info] workspace: ${wkd}`)
    switch (option.mode) {
        case 'insert-to-readme':
            // insert markdown table to readme
            insertReadme(text, wkd)
            break;
        default:
            writeTempfile(text,wkd)
            break;
    }
    return text
}


// file usage
// node scr/6.gen-lib-size.js ./
// node scr/6.gen-lib-size.js ./packages/noop
// node scr/6.gen-lib-size.js ./packages/jcm
