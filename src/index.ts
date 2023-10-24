import svgtofont from 'svgtofont';
import {resolve} from 'path';
import {rmSync} from 'fs';

// import type {SvgToFontOptions,IconInfo,InfoData} from 'svgtofont/lib';

const {log}=console
function doNothing(){

}
function runasync(main:Function){
    return main().then(doNothing).catch(doNothing)
}

// function getWorkingSpace(){
//     return process.cwd()
// }
// function getSource(src:string){
//     return path.resolve(src)
// }

export type NameUnicodeKV = [string,string,Number]




// 
function getStrUnicodeHex(s:string){
    let res = getStrUnicode(s)
	return num2StrHex(res)
}
// some icon str -> 10000
function getStrUnicode(s:string){
    let res = s.charCodeAt(0)
    return res
}

// 10000 -> '0x2710'
// 0x6e00 -> 28160 -> '0x6e00'
function num2StrHex(num:number){
	let hex=num.toString(16);
    let zero = '0000';
    let tmp  = 4-hex.length;
    return '0x' + zero.substring(0,tmp) + hex;
}
//'0x6e00' -> 28160
function num5StrHex(s:string){
    return parseInt(s)
}

// encodeURI
async function main(){
    log(`[info] hello, zero!`)

    // log(`[icon] hello, zero!`)



    let workspace = process.cwd();
    let icon = resolve(workspace, 'icons')
    let fonts = resolve(workspace, 'fonts')
    let nameUnicodeMap:NameUnicodeKV[] = []
    function getIconUnicode(name: string, unicode: string, startUnicode: number):[string,number]{
        // getStrUnicode(unicode)
        nameUnicodeMap.push([name,getStrUnicodeHex(unicode),startUnicode])
        return [unicode,startUnicode]
    }

    log(`[font] clean output dirs ${fonts}`)
    rmSync(fonts,{force:true,recursive:true})

    svgtofont({
        src: icon, // svg path
        dist: fonts, // output path
        fontName: 'iconfont', // font name
        // classNamePrefix:'iconfont',
        css: true, // Create CSS files.
        symbolNameDelimiter:'-',
        outSVGPath:true,
        // startUnicode:10000,
        // startUnicode:60000,
        // startUnicode:0x6e00,
        startUnicode: num5StrHex('0x6e00'),
        typescript:true,
        getIconUnicode:getIconUnicode,
      }).then(() => {
        log(`[font] make from ${icon} to ${fonts}`)
        log(`[font] info name unicode`, nameUnicodeMap)
        log(`[code] 0x6e00: `, num5StrHex('0x6e00'))
        log(`[code] 28160: `, num2StrHex(28160))
      });
}

runasync(main)
// tsx src/index.ts