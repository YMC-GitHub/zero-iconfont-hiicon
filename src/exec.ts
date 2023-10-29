// import iconv from "iconv-lite";
// import type {Options as iconvOptions} from "iconv-lite";
import { exec } from 'child_process'

export type  ExecOption = Record<string,any>
export type  CmdOption = string[]
export interface ExecOptionLike {
    exec?:(error: any, stdout: string, stderr: string) => void,
    exitWhenErr?:boolean,
    noTrimOut?:boolean,
    rejectStderr?:boolean
    fixUnreadbleCode?:(iconv: any)=> (code: any, encoding?: string, binaryEncoding?: string) => any
    iconvDesEncoding?:string,
    iconvSrcEncoding?:string
}
// type run = (error: any, stdout: string, stderr: string) => void

export const execOpts:ExecOption = {exec}

/**
 * exec wraper
 * @param {string} cmd some cmd
 * @param {object} cmdOpts some cmd opts
 * @param {object} execOpts some exec opts
 * @returns {Promise}
 * @sample
 * ```js
 * await exec(`git`,`--version`,execOpts) //correct
 * await exec(`git`,[`--version`],execOpts) //correct
 * await exec(`git --version`,execOpts) //correct
 * ```
 */
export function execWraper(cmd:string, cmdOpts:string|CmdOption|ExecOption, execOpts?:ExecOption) {

    return new Promise((resolve, reject) => {
        let [cli, execOption] = stdInput(cmd,cmdOpts,execOpts)
         // @ts-ignore
        // fix: exec is optional in execOpts
        const run = execOption.exec ? execOption.exec : exec
        // delete execOption.exec; //desc:clean some property to keep execOption as native

        // todo: run hook name 'pre' here
        // ...


        // support exe opt : exec(cmd,execOption,callback)
        // https://stackoverflow.com/questions/18894433/nodejs-child-process-working-directory
        run(cli, execOption, (e:any, stdout:string, stderr:string) => {

            // todo: run hook name 'post' here
            // ...

            // feat:fix unreadable zh code\with option.fixUnreadbleCode
            const { fixUnreadbleCode } = execOption
            if (fixUnreadbleCode) {
                const { iconvDesEncoding, iconvSrcEncoding } = execOption
                // fix: convert unreadble code only with code
                // fixUnreadbleCode=(code,charset="cp936")=>{return iconv.decode(err, charset)})
                // if (e) e = fixUnreadbleCode(e, iconvDesEncoding, iconvSrcEncoding)//del
                if (stdout) stdout = fixUnreadbleCode(stdout, iconvDesEncoding, iconvSrcEncoding)
                if (stderr) stderr = fixUnreadbleCode(stderr, iconvDesEncoding, iconvSrcEncoding)
                // console.log(e, stdout, stderr)
            }

            // todo: run hook name 'onerror' here
            // ...

            // feat: set reject err to be optional\nwhen execOption.exitWhenErr=true
            if (e && execOption.exitWhenErr) {
                reject(e)
            }


            // todo: run hook name 'transform' here
            // ...

            // feat(core): trim stdout and stderr \ndo not trim when execOption.noTrimOut=true
            if (!execOption.noTrimOut) {
                stdout = trimStd(stdout)
                stderr = trimStd(stderr)
            }

            // case:reject std err and resolve std res
            // feat(core): set reject stderr to be optional in execOption
            // reject when execOption.rejectStderr=true
            if (execOption.rejectStderr) {
                if (stderr) {
                    reject(e)
                }
                resolve(stdout)
            }

            // case:resolve std err and res
            resolve({ stdout, stderr })
        })
    })

}

export function stdInput(cmd: string, cmdOpts: string | CmdOption | ExecOption, execOpts?: ExecOption): [string, ExecOption] {
    // @ts-ignore
    let cmdOption: CmdOption = cmdOpts
    // @ts-ignore
    let execOption: ExecOption = execOpts

    // desc: for exec(`git --version`],execOpts)
    if (execOpts === undefined) {
        //  (typeof cmdOpts !=="string" && !Array.isArray(cmdOpts))
        // @ts-ignore
        execOption = cmdOpts;
        // @ts-ignore
        cmdOption = cmd
        cmd = ''
    }
    // @ts-ignore
    // 'a b' or ['a','b'] -> 'a b'
    const option = ensureString(cmdOption)

    let cli:string = cmd ? `${cmd} ${option}` : `${option}`

    return [cli, execOption]
}


export function ensureArray(s: string | string[], splitChar: string | RegExp = ' ') {
    return Array.isArray(s) ? s : s.split(splitChar)
}

export function ensureString(s: string | string[], splitChar = ' ') {
    return Array.isArray(s) ? s.join(splitChar) : s
}

export function trimStd(stdout:string) {
    // data: \r\n -> \n
    // handle: str2arr,trim,no-empty,arr2str
    return stdout
        .split(/\r?\n/)
        .map(v => v.trim())
        .filter(v => v)
        .join('\n')
}



// exec-plugin-iconv -- fix chinese to readalbe
/**
 *
 * @param {{decode:function}} iconv
 * @returns {function}
 * @sample
 * ```
 *  // pnpm add iconv-lite
 *  import iconv from "iconv-lite";
 *  let fixUnreadbleCode = defFixUnreadbleCode(iconv)
 *  execOpts.encoding = "buffer";
 *  execOpts.fixUnreadbleCode = fixUnreadbleCode;
 *  execOpts.iconvDesEncoding="cp936"
 *  execOpts.iconvSrcEncoding="binary"
 *  await exec(`dir`, execOpts);
 * ```
 */
// @ts-ignore
export function defFixUnreadbleCode(iconv) {
    // why: Simplified Chinese windows command line, all use CP936 (similar to gb2312) code, nodejs to utf8 identification is a problem.
    // how to : Binary is used to store the output text, and iconv is used to parse it in cp936.
    return function (code:any, encoding:string = 'cp936', binaryEncoding:any = 'binary') {
        iconv.skipDecodeWarning = true
        return iconv.decode(Buffer.from(code, binaryEncoding), encoding)
    }
}
// encode(content: string, encoding: string, options?: iconv.Options | undefined): Buffer
// decode(buffer: Buffer, encoding: string, options?: iconv.Options | undefined): string
// iconv.decode()

// Assignment to property of function parameter 'iconv'  no-param-reassign

/**
 *
 * @param {{decode:function}} iconv
 * @param {{}} execOpts
 * @sample
 * ```
 * import iconv from "iconv-lite";
 * setExecOptsForIconv(iconv,execOpts)
 * await exec(`dir`, execOpts);
 * ```
 */
export function setExecOptsForIconv(iconv:any, execOpts:ExecOption) {
    // fix Assignment to property of function parameter 'execOpts'  no-param-reassign
    /* eslint-disable no-param-reassign */
    // std 1.1 set execOpts.encoding as 'binary' || 'buffer'
    execOpts.encoding = 'buffer' // binary || buffer
    // std 1.2 def fixUnreadbleCode(code,desencoding,srcencoding)
    execOpts.iconvDesEncoding = 'cp936'
    execOpts.iconvSrcEncoding = 'binary'
    // execOpts.fixUnreadbleCode = fixUnreadbleCode;
    execOpts.fixUnreadbleCode = defFixUnreadbleCode(iconv)
    // res = await exec(`dir`, execOpts);
}

// exec-transfrom-stdout?
/**
 * 
 * @sample 
 * ```
 * rejectStderr(execOpts)
 * execWraper(cmd,execOpts)
 * ```
 */
export function rejectStderr(execOpts:ExecOption,switcher:boolean=true){
    execOpts.rejectStderr=switcher
    return execOpts
}

// exec-transfrom-notrimout?
/**
 * 
 * @sample 
 * ```
 * noTrimOut(execOpts)
 * execWraper(cmd,execOpts)
 * ```
 */
export function noTrimOut(execOpts:ExecOption,switcher:boolean=true){
    execOpts.noTrimOut=switcher
    return execOpts
}


/**
 * 
 * @sample 
 * ```
 * noTrimOut(execOpts)
 * execWraper(cmd,execOpts)
 * ```
 */
export function exitWhenErr(execOpts:ExecOption,switcher:boolean=true){
    execOpts.exitWhenErr=switcher
    return execOpts
}

async function demo(){
    // setExecOptsForIconv(iconv,execOpts)
    let res = await execWraper(`dir`,execOpts)
    console.log(res)
}



// script-file-entry-detect

// import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// file:///D:/code/xx ->  D:\code\xx
// console.log(import.meta.url,__filename)
// console.log(process.argv.slice(0,2))
export function mockMagicMain(){
    return process.argv.slice(0,2).includes(fileURLToPath(import.meta.url))
}

// mock python __main
const __main = mockMagicMain();
if(__main) demo();


// tsx src/exec.ts