import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { resolve as resolvePath } from 'path'

import parse from "./nano-args"
import type { NanoArgsData } from "./nano-args"

import { getFileList } from './file-list'
import { getFileSize, toKeyValTree, toMarkdownTable, writeMarkdownFile } from "./file-size"

import { loadTextFile, toFontCssCdn, parseGithubUrl, getCdnJsdelivrUrl } from "./cdn"
import { touch } from "./touch"
import { readJsonFileSync, writeJsonFileSync, sortJsonByKeys, editKeywords, editName, editRepo, getJsonContextInNs, setJsonValueInNs, readTextFileSync, writeTextFileSync } from "./editjson"
import { downloadFile } from "./download"
import { rm, mv, cp } from "./rm"
import { gitcmtmsgJsonify, rungit } from "./commitlog"
import { execOpts } from "./exec"
import { camelize } from "./string"
import { Interface } from 'readline'
import { getCmtPkgs } from "./commitpkg"
import { genChangelog } from './changelog'
import { globy } from './globy'

import { addProfile, editCaCsr } from './qgssl'
import { formatDate } from './date'

const { log } = console
function doNothing() {

}
function runasync(main: Function, env: 'pro' | 'dev' = 'pro') {
    // feat(core): enable err log in dev env
    // feat(core): close err log in pro env
    let logfunc = env === 'pro' ? doNothing : log
    return main().then(doNothing).catch(logfunc)
}

function valIsOneOfList(val: any, list: any[]) {
    return list.includes(val)
}

function cmdListify(cmd: string) {
    return cmd.split(",").map(v => v.trim()).filter(v => v)
}
// mock path.join
function join(...pathLike: string[]) {
    return pathLike.join('/').replace(/\/{2,}/, '/')
}


/**
 * 
 * @sample
 * ```
 * isOneOfThem('src/xx','*commitlog filter*')
 * ```
 */
function isOneOfThem(one: string, them: string) {
    // feat(core): regard them as regexp when including *
    // feat(core): split them with ,
    // feat(core): ignore empty space in them

    if (!them) return false
    let isReg = them.indexOf('*') >= 0
    let input: string[] = them.split(",").map(v => v.trim()).filter(v => v)
    if (isReg) {
        // feat: regard * as .*
        let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
        // console.log(inputReg)
        // list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
        return inputReg.some(reg => reg.test(one))
    }
    return input.includes(them)
}

interface CliGetCmdOption {
    name: string,
    mode: 'flags-important' | '_-important',
    // cmd in the _ index
    index: number
}
type CliGetCmdOptionLike = Partial<CliGetCmdOption>

function cliGetCmd(data: NanoArgsData, opts?: CliGetCmdOptionLike, def: string = '') {
    let cmd = cliGetValue(data, opts)
    let res: string = ''
    // ensure string and avoid undefined
    res = cmd !== undefined ? cmd.toString() : ''
    // use the default value 
    res = res ? res : def
    return res
}

/**
 * 
 * @param name 
 * @sample
 * ```
 * // '-w,--ws,--workspace -- set cli worksapce' -> 'w,ws,workspace'
 * cliGetPureName('-w,--ws,--workspace')
 * ``` 
 */
function cliGetPureName(name: string) {
    let res: string = ''
    // '-w,--workspace -- set location of xx'  -> '-w,--workspace'
    let [sl] = name.trim().split(" ")

    // '-w,--workspace' -> 'w,workspace'
    let namelist = sl.split(",").map(v => v.trim().replace(/^-+/, '')).filter(v => v)

    //'--pkg-loc' -> 'pkgLoc'
    namelist = namelist.map(name => camelize(name))

    // only short and long
    // let [s,l]=namelist
    // res= [s, l].join(",")

    // '-w,--ws,--workspace'
    // support  name 3+ 
    res = namelist.join(",")
    return res
}

// 
// cliGetValueByName({flags:{w:true}},'-w,--workspace') -> true

/**
 * 
 * @sample
 * ```ts
 * cliGetValueByName({flags:{w:true}},'-w') // -> true
 * cliGetValueByName({flags:{w:true}},'-w,--workspace') // -> true
 * ``` 
 */
function cliGetValueByName(data: NanoArgsData, name: string) {
    let pname = cliGetPureName(name).split(",")
    let { flags, _, extras } = data
    let res
    for (let index = 0; index < pname.length; index++) {
        const pni = pname[index];
        if (pni in flags) {
            res = flags[pni]
            break;
        }
    }
    return res
}


function cliGetValue(data: NanoArgsData, opts?: CliGetCmdOptionLike, def?: any) {

    let buitinOption: CliGetCmdOption = { name: 'cmd', mode: 'flags-important', index: 0 }
    let option = opts ? { ...buitinOption, ...opts } : buitinOption

    let res: string = ''

    let { flags, _, extras } = data
    // use the first value in _ as cmd 
    // 'ns file-size' -> 'file-size'
    // let [cmd] = _
    // use the index value in _ as cmd ,when index is < 0, means that not use index
    let cmd = option.index < 0 ? undefined : _[option.index]

    // use the cmd in flags 
    // 'ns --cmd file-size' -> 'file-size'
    let cmdInOption = cliGetValueByName(data, option.name)

    // use cmd in _ or use cmd in flags ?
    if (option.mode === '_-important') {
        cmd = (cmd != undefined && cmdInOption) ? cmdInOption : cmd; //cmd in _  important!
    }
    if (option.mode === 'flags-important') {
        cmd = cmdInOption != undefined ? cmdInOption : cmd; //cmd in flags important!
    }

    // ensure string and avoid undefined
    // res= cmd?cmd.toString():''
    // use the default value 
    // res= res?res:def

    cmd = cmd != undefined ? cmd : def
    return cmd
}


interface CamelizeFlagsOption {
    noAutoCamelize: boolean,
    slim: boolean
}
type CamelizeFlagsOptionLike = Partial<CamelizeFlagsOption>
type PlainObject = Record<string, any>

function camelizeFlags(flags: PlainObject = {}, options: CamelizeFlagsOptionLike = {}) {
    // let res = {}
    const option: CamelizeFlagsOption = {
        slim: true,
        noAutoCamelize: false,
        ...options
    }
    if (option.noAutoCamelize) return flags
    Object.keys(flags).forEach(k => {
        const ck = camelize(k)
        // res[ck]=flags[k]
        if (ck !== k) {
            flags[ck] = flags[k]
            if (option.slim) {
                delete flags[k]
            }
        }
    })
    return flags
}


function decodeJSON(a: any) {
    return JSON.stringify(a, null, 0)
}

function delstrPrefix(str: string, flag: boolean, prefix: string) {
    str = flag ? str.replace(new RegExp(`^${prefix}`, 'ig'), '') : str
    return str
}

// 'ab' -> 'an/'
function ensureEndsWith(s: string, sep: string = '/') {
    return s.endsWith(sep) ? s : `${s}${sep}`
}

// '/a/b' -> '/a/b/' or '\\a\\b' -> '\\a\\b\\'
function autoEndsWithSep(s: string) {
    let backSlash = '\\'
    let backSlashInS = s.indexOf(backSlash)

    // back slash first
    if (backSlashInS >= 0) {
        ensureEndsWith(s, backSlash)
    } else {
        ensureEndsWith(s, '/')
    }
}
function getValue(s: any, def: any = '') {
    return s ? s : def
}

function makeGithubProxyUrl(url: string, ghproxy: string, sites: string | string[] = `https://raw.githubusercontent.com,https://github.com`) {
    let ghu = ensureArray(sites)

    // https://github.com -> https://ghproxy.com/https://github.com
    if (ghproxy !== undefined && ghu.some(u => url.startsWith(u))) {
        url = `${ghproxy}${url}`
    }
    return url

    // 'a,b,c' -> ['a','b','c']
    function arrayify(s: string) {
        return s.split(",").map(v => v.trim()).filter(v => v)
    }

    // 'a,b,c' or ['a','b','c'] -> ['a','b','c']
    function ensureArray(sites: string | string[]) {
        return Array.isArray(sites) ? sites : arrayify(sites)
    }
}

/**
 * 
 * @sample
 * ```
 * // './a/b/c/' -> './a/b/c'
 * noEndSlash(`./a/b/c/`)
 * ```
 */
function noEndSlash(s: string) {
    return s.replace(/\/+$/, '')
}

/**
 * 
 * @sample
 * ```
 * // './a/b/c' -> './a/b/c/'
 * noEndSlash(`./a/b/c/`)
 * ```
 */
function endSlash(s: string) {
    return s.replace(/\/+$/, '/')
}




async function main() {

    log(`[zero] hello, zero!`)

    // log(`[debug] nano  parse:`)
    let input = process.argv.slice(2);
    log(`[info] cli input`, decodeJSON(input));
    let cliArgs = parse(input);
    camelizeFlags(cliArgs.flags)
    // log(cliArgs)
    // let {flags,_,extras} =cliArgs;log(flags,_,extras);

    log(`[info] nano parse result`, decodeJSON(cliArgs))

    // process.exit(0)
    // get cmd
    let cmd = cliGetCmd(cliArgs, { name: 'cmd', index: 0, mode: 'flags-important' })

    if (valIsOneOfList(cmd, cmdListify('noop'))) {
        let wkd: string = ''
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)
        log(`[info] pwd :`, resolvePath('./'))
    }

    if (valIsOneOfList(cmd, cmdListify('set-bin-head'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let head = cliGetCmd(cliArgs, { name: 'head', index: -1, mode: 'flags-important' }, '#! /usr/bin/env node')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readTextFileSync(location)
        log(`[${cmd}] edit ${location}`)
        data = addTextFileHead(data, head)
        function addTextFileHead(data: string, head: string = '') {
            if (!head) return data

            let res: string = ''
            let arr = data.split(/\r?\n/)
            let exist = arr[0].includes("#!")
            if (!exist) {
                // add
                res = `${head}\n${data}`
            } else {
                // put
                arr[0] = head
                res = arr.join("\n")
            }
            return res
        }
        log(`[${cmd}] write ${location}`)
        writeTextFileSync(location, data)
    }

    if (valIsOneOfList(cmd, cmdListify('get-cmted-pkgs,get-cmted-pkg'))) {
        // get working dir
        let wkd: string = ''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)

        await getCmtPkgs(cliArgs.flags)
    }
    if (valIsOneOfList(cmd, cmdListify('get-changed-files,add-changed-files'))) {
        // your get-changed-files src*
        // get working dir
        let wkd: string = ''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)
        let include = cliGetCmd(cliArgs, { name: 'include', index: 1, mode: 'flags-important' }, '*')
        let files: string[] = (await rungit(`git ls-files --modified `, execOpts)).split(/\r?\n/).filter(v => v)
        let changedFilesInSrc: string[]
        // changedFilesInSrc =globy(include, files)
        changedFilesInSrc = files.filter(file => isOneOfThem(file, include))
        // isOneOfThem()
        log(changedFilesInSrc.join('\n'))
        if (valIsOneOfList(cmd, cmdListify('add-changed-files'))) {
            if (changedFilesInSrc.length > 0) await rungit(`git add ${changedFilesInSrc.join(' ')}`, execOpts)
        }
    }
    if (valIsOneOfList(cmd, cmdListify('get-untracked-files,add-untracked-files'))) {
        // your get-changed-files src*
        // get working dir
        let wkd: string = ''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)
        let include = cliGetCmd(cliArgs, { name: 'include', index: 1, mode: 'flags-important' }, '*')
        let files: string[] = (await rungit(`git ls-files --others --exclude-standard `, execOpts)).split(/\r?\n/).filter(v => v)
        let changedFilesInSrc: string[]
        // changedFilesInSrc =globy(include, files)
        changedFilesInSrc = files.filter(file => isOneOfThem(file, include))
        // pick
        // isOneOfThem()
        log(changedFilesInSrc.join('\n'))
        if (valIsOneOfList(cmd, cmdListify('add-untracked-files'))) {
            if (changedFilesInSrc.length > 0) await rungit(`git add ${changedFilesInSrc.join(' ')}`, execOpts)
        }
    }
    if (valIsOneOfList(cmd, cmdListify('get-new-files,restore-new-files'))) {
        // tsx src/cli.ts get-new-files
        // your get-changed-files src*
        // get working dir
        let wkd: string = ''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)
        let include = cliGetCmd(cliArgs, { name: 'include', index: 1, mode: 'flags-important' }, '*')

        // git status  | grep "new file:"
        let files: string[] = (await rungit(`git status `, execOpts)).split(/\r?\n/).filter(v => v)
        let newfiles: string[]
        newfiles = files.filter(file => /new file:/.test(file))
        newfiles = newfiles.map(file => file.replace(/new file:/, '').trim())
        // isOneOfThem()
        log(newfiles.join('\n'))
        if (valIsOneOfList(cmd, cmdListify('restore-new-files'))) {
            if (newfiles.length > 0) await rungit(`git restore --staged ${newfiles.join(' ')}`, execOpts)
        }
    }


    if (valIsOneOfList(cmd, cmdListify('cmt-files'))) {
        // your cmt-files --date-format "+%Y-%m-%d %H:%M:%S" --time "2023-11-06 08:00:00" --msg "build(core): add func to  manage commitlog" --time-zone "+0800"
        // get working dir
        let wkd: string = ''
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)

        let format = cliGetCmd(cliArgs, { name: 'date-format', index: -1, mode: 'flags-important' }, 'yyyy-MM-dd HH:mm:ss') //'+%Y-%m-%d %H:%M:%S'
        let time = cliGetCmd(cliArgs, { name: 'time', index: -1, mode: 'flags-important' }, '')
        let msg = cliGetCmd(cliArgs, { name: 'm,msg', index: -1, mode: 'flags-important' }, '')
        let timezone = cliGetCmd(cliArgs, { name: 'timezone,tz', index: -1, mode: 'flags-important' }, '+0800')
        let timestr = formatDate(format, time ? new Date(time) : new Date())
        let msgFile = cliGetCmd(cliArgs, { name: 'msg-file', index: -1, mode: 'flags-important' }, '')
        let dryrun = cliGetCmd(cliArgs, { name: 'dryrun', index: -1, mode: 'flags-important' }, '')
        let printCmd = cliGetCmd(cliArgs, { name: 'print-cmd', index: -1, mode: 'flags-important' }, '')

        let oscmdl: string[] = []
        oscmdl.push(`git commit`)
        if (msg) {
            oscmdl.push(`-m "${msg}"`)
        } else if (msgFile) {
            oscmdl.push(`--file "${msgFile}"`)
        }
        if (timestr) {
            // ['--date', timestr, timezone].filter(v => v).join(' ')
            let times = timezone ? `--date "${timestr} ${timezone}"` : `--date "${timestr}"`
            oscmdl.push(times)
        }
        let tpl: string = oscmdl.join(' ')
        if (dryrun) {
            log(tpl)
        } else {
            if (printCmd) log(tpl)
            await rungit(tpl, execOpts)
        }
    }


    if (valIsOneOfList(cmd, cmdListify('download,down'))) {
        log(`[info] usage: yours download --url https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/circle.svg --file svg/circle.svg --ghproxy "https://ghproxy.com/"`)
        // supoort touch --url xx 
        let url: string = cliGetCmd(cliArgs, { name: 'u,url', index: -1, mode: 'flags-important' })
        // --file 
        let file: string = cliGetCmd(cliArgs, { name: 'f,file', index: -1, mode: 'flags-important' })
        let ghproxy: string = cliGetCmd(cliArgs, { name: 'ghproxy', index: -1, mode: 'flags-important' }, '');//https://ghproxy.com/

        // let url: string='https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/circle.svg'
        // let ghproxy='https://ghproxy.com/'

        // url='https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@6.x//svgs/regular/circle.svg'
        url = makeGithubProxyUrl(url, ghproxy)
        // log(url)
        // 'svg/circle.svg'
        downloadFile(url, { targetFile: file, overideTargetFile: false })
        // tsx ./src/cli.ts download --url https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/circle.svg --file svg/circle.svg
    }

    if (valIsOneOfList(cmd, cmdListify('touch,add-txt-file'))) {
        // get working dir
        let wkd: string = ''
        // - supoort touch --wkd xx 
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: -1, mode: 'flags-important' })
        wkd = getValue(wkdInCmd, './')
        log(`[${cmd}] workspace: ${wkd}`)

        // supoort touch --file xx and compact with touch xx
        let file = cliGetCmd(cliArgs, { name: 'file', index: 1, mode: 'flags-important' })
        file = getValue(file, '')
        let text = cliGetCmd(cliArgs, { name: 'text', index: 2, mode: 'flags-important' })
        text = getValue(text, '')
        log(`[${cmd}] touch ${file}`)
        touch(file, text)
    }
    if (valIsOneOfList(cmd, cmdListify('cat'))) {
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)
        log(`[${cmd}] read ${location}:`)
        let data = readTextFileSync(location)
        log(data)
    }

    if (valIsOneOfList(cmd, cmdListify('sortjsonkey,sjkey'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx and compact with sortjsonkey xx
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)

        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)
        log(`[${cmd}] list json keys : ${Object.keys(data)}`)

        let order = cliGetCmd(cliArgs, { name: 'order', index: -1, mode: 'flags-important' }, `name,version,description,main,types,scripts,repository,keywords,author,license,bugs,homepage,dependencies,devDependencies`)
        data = sortJsonByKeys(data, order)
        // name,version,description,main,devDependencies,scripts,repository,keywords,author,license,bugs,homepage
        writeJsonFileSync(location, data)
        //
    }

    if (valIsOneOfList(cmd, cmdListify('edit-keywords'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --include a,d
        let include = cliGetCmd(cliArgs, { name: 'include', index: -1, mode: 'flags-important' }, '')
        // supoort sortjsonkey --exclude a,b,c,d
        let exclude = cliGetCmd(cliArgs, { name: 'exclude', index: -1, mode: 'flags-important' }, '')
        // supoort sortjsonkey --sep ,
        let sep = cliGetCmd(cliArgs, { name: 'sep', index: -1, mode: 'flags-important' }, ',')
        // supoort sortjsonkey --ns keywords
        let ns = cliGetCmd(cliArgs, { name: 'ns', index: -1, mode: 'flags-important' }, 'keywords')
        let nsSep = cliGetCmd(cliArgs, { name: '--ns-sep', index: -1, mode: 'flags-important' }, '.')
        // let key = [ns, name].filter(v => v).join(nsSep)

        log(`[${cmd}] edit: ${ns}`)
        let { context, lastns } = getJsonContextInNs(ns, data, nsSep)
        // editKeywords(data, { include, exclude, sep, ns })
        editKeywords(context, { include, exclude, sep, ns: lastns })
        log(`[${cmd}] write: ${location}`)
        writeJsonFileSync(location, data)
    }

    if (valIsOneOfList(cmd, cmdListify('edit-name'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let ns = cliGetCmd(cliArgs, { name: '--ns', index: -1, mode: 'flags-important' }, 'name')
        let org = cliGetCmd(cliArgs, { name: '-o,--org', index: -1, mode: 'flags-important' }, '')
        let name = cliGetCmd(cliArgs, { name: '-n,--name', index: -1, mode: 'flags-important' }, '')
        editName(data, { ns, name, org })
        writeJsonFileSync(location, data)
    }


    if (valIsOneOfList(cmd, cmdListify('edit-bool'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let name = cliGetCmd(cliArgs, { name: '-n,--name', index: -1, mode: 'flags-important' }, 'private')
        let value = cliGetValue(cliArgs, { name: '-v,--value', index: -1, mode: 'flags-important' })

        log([name, value])
        if (value !== undefined) {
            data[name] = value
        }
        writeJsonFileSync(location, data)
    }

    // editRepo
    if (valIsOneOfList(cmd, cmdListify('edit-repo'))) {
        // get working dir
        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)

        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location)

        // supoort sortjsonkey --ns keywords
        let user = cliGetCmd(cliArgs, { name: '-u,--user', index: -1, mode: 'flags-important' }, 'ymc-github')
        let repo = cliGetCmd(cliArgs, { name: '-r,--repo', index: -1, mode: 'flags-important' }, 'noop')
        let mono = cliGetValue(cliArgs, { name: '-m,--mono', index: -1, mode: 'flags-important' })
        let packageLoc = cliGetCmd(cliArgs, { name: '-l,--package-loc', index: -1, mode: 'flags-important' })
        let branch = cliGetCmd(cliArgs, { name: '-b,--branch', index: -1, mode: 'flags-important' })
        let name = cliGetCmd(cliArgs, { name: '-n,--name', index: -1, mode: 'flags-important' }, '')
        // todo:param,usage,option
        log([packageLoc])
        editRepo(data, { user, repo, mono: mono ? true : false, name, packageLoc, branch })
        writeJsonFileSync(location, data)
    }


    if (valIsOneOfList(cmd, cmdListify('edit-script'))) {

        // feat(core): pass default text for text file reading  --default-text '{}'
        // feat(core): pass file location for text file reading  --file 'package.json'

        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: 1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)
        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')
        let defaultText = cliGetCmd(cliArgs, { name: 'default-text', index: -1, mode: 'flags-important' }, '{}')

        let location: string = join(ws, file)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data = readJsonFileSync(location, defaultText)
        // log(JSON.stringify(data, null, 0))
        // supoort sortjsonkey --ns keywords
        let name = cliGetCmd(cliArgs, { name: '-n,--name', index: -1, mode: 'flags-important' }, '')//test
        let value = cliGetValue(cliArgs, { name: '-v,--value', index: -1, mode: 'flags-important' })
        let ns = cliGetCmd(cliArgs, { name: '--ns', index: -1, mode: 'flags-important' }, '') //scripts
        let nsSep = cliGetCmd(cliArgs, { name: '--ns-sep', index: -1, mode: 'flags-important' }, '.')


        // let {context} = getJsonContextInNs(`${ns}${nsSep}${name}`,data,nsSep)
        // context[name]=value
        // log([name, value])
        log(`[${cmd}] edit: ${name}`)
        // data = setJsonValueInNs(`${ns}${nsSep}${name}`, value, data, nsSep)
        let key = [ns, name].filter(v => v).join(nsSep)
        log(`[info] log ns,name join with ${nsSep}`, key)
        data = setJsonValueInNs(key, value, data, nsSep)

        log(`[${cmd}] save: ${location}`)
        writeJsonFileSync(location, data)
    }

    if (valIsOneOfList(cmd, cmdListify('qgssl-add-profile'))) {
        // todo:add qgssl
        // addProfile,editCaCsr
        // feat(core): pass default text for text file reading  --default-text '{}'
        // feat(core): pass file location for text file reading  --file 'package.json'

        // - supoort sortjsonkey -w xx  and compact with sortjsonkey xx
        let ws = cliGetCmd(cliArgs, { name: 'w,workspace', index: -1, mode: 'flags-important' }, './')
        log(`[${cmd}] workspace: ${ws}`)
        // supoort sortjsonkey --file xx 
        let file = cliGetCmd(cliArgs, { name: 'file', index: -1, mode: 'flags-important' }, 'package.json')
        let defaultText = cliGetCmd(cliArgs, { name: 'default-text', index: -1, mode: 'flags-important' }, '{}')

        let location: string = join(ws, `ca-config.json`)
        // todo:join -- join,abs,rel-to-rcd,like-slash
        log(`[${cmd}] read ${location}`)
        let data: any
        data = readJsonFileSync(location, defaultText)
        data = addProfile(data, cliArgs.flags)
        log(`[${cmd}] save: ${location}`)
        writeJsonFileSync(location, data)


        location = join(ws, `ca-csr.json`)
        log(`[${cmd}] read ${location}`)
        data = readJsonFileSync(location, defaultText)
        data = editCaCsr(data, cliArgs.flags)
        log(`[${cmd}] save: ${location}`)

        location = join(ws, `ca-csr.json`)
        log(`[${cmd}] read ${location}`)
        data = readJsonFileSync(location, defaultText)
        data = editCaCsr(data, cliArgs.flags)
        log(`[${cmd}] save: ${location}`)

    }

    if (valIsOneOfList(cmd, cmdListify('cp,copy'))) {
        // support: cp src des,cp --src src --des des,cp -s src -d des
        let src = cliGetCmd(cliArgs, { name: '-s,--src', index: 1, mode: 'flags-important' }, '')
        // supoort cmd --des xx  or cmd src des
        let des = cliGetCmd(cliArgs, { name: '-d,--des', index: 2, mode: 'flags-important' }, '')

        cp(src, des)
    }
    if (valIsOneOfList(cmd, cmdListify('rm,remove,del'))) {
        // support: cp src des,cp --src src --des des,cp -s src -d des
        let src = cliGetCmd(cliArgs, { name: '-s,--loc', index: 1, mode: 'flags-important' }, '')

        rm(src)
    }
    if (valIsOneOfList(cmd, cmdListify('get-commitlog,gcmh-to-json,git-cmt-msg-history-to-json'))) {
        // support: cp src des,cp --src src --des des,cp -s src -d des
        let src = cliGetCmd(cliArgs, { name: '--file', index: -1, mode: 'flags-important' }, '')
        let count = Number(cliGetValue(cliArgs, { name: '-n,--count', index: -1, mode: 'flags-important' }, 10))
        let countall = Boolean(cliGetValue(cliArgs, { name: '--count-all', index: -1, mode: 'flags-important' }))

        gitcmtmsgJsonify(src, count, countall)
    }

    if (valIsOneOfList(cmd, cmdListify('changelog,chg'))) {
        genChangelog(cliArgs.flags)
    }





    if (valIsOneOfList(cmd, cmdListify('file-size,2'))) {
        // file-zise ./packages/jcm
        log(`[file-size] get file size`)

        let wkd = './'
        let wkdInCmd = cliGetCmd(cliArgs, { name: '-w,--wkd', index: 1, mode: 'flags-important' })
        wkd = wkdInCmd ? wkdInCmd : wkd
        // log(`[file-size] workspace: ${wkdInCmd}`)
        let stdWkd = noEndSlash(wkd)

        log(`[file-size] workspace: ${wkd}`)

        // log(`[file-size] file list`)
        // --dirs lib
        let inDirs = cliGetCmd(cliArgs, { name: 'dirs', index: 1, mode: 'flags-important' })
        inDirs = getValue(inDirs, 'lib|dist|bin')
        // --ext
        let rule = cliGetCmd(cliArgs, { name: 'ext', index: 1, mode: 'flags-important' })
        rule = getValue(rule, '.js$')

        let files = getFileList(inDirs, { wkd: wkd, macthRules: [new RegExp(rule)] })
        // log(files)

        log(files.map(file => { return { ...file, name: file.name.replace(new RegExp(`^${stdWkd}/`), '') } }))


        log(`[file-size] size of file list: \n`)
        let fsdList = files.map(file => {
            // let 
            let fsd = getFileSize(file.name)
            // fsd[0] = delstrPrefix(fsd[0], true,ensureEndsWith(wkd,'/'))
            return fsd
        })
        // log(fsdList)

        // relative to wkd (to show in result)

        fsdList.forEach(fsd => {
            fsd[0] = fsd[0].replace(new RegExp(`^${stdWkd}/`), '')
        })
        log(fsdList)
        // let fsdkvList = fsdList.map(fsd=>toKeyValTree(fsd))
        // log(`[file-size] to key value tree:`)
        // log(fsdkvList)

        let markdownTable = toMarkdownTable(fsdList)
        log(`[file-size] markdown table of file size: \n`)
        log(markdownTable)
        // log(`[file-size] write to markdown file: \n`)
        writeMarkdownFile({ text: markdownTable, wkd: ensureEndsWith(wkd, '/') })

    }


    if (valIsOneOfList(cmd, cmdListify('css-cdn'))) {
        log(`[css-cdn] get cdn for iconfont.css`)

        let wkd = './'
        let wkdInCmd = cliGetCmd(cliArgs, { name: 'wkd', index: 1, mode: 'flags-important' })
        wkd = wkdInCmd ? wkdInCmd : wkd
        // log(`[file-size] workspace: ${wkdInCmd}`)

        let text: string = ''


        text = loadTextFile(`fonts/iconfont.css`)
        // // todo: slice @font-face  { xxx }
        let cdncss: string = ''

        // cdncss=toFontCssCdn({text,cdn:'//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.'})
        cdncss = toFontCssCdn({ text, cdn: '//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/fonts/iconfont.' })
        log(cdncss)

        // https://juejin.cn/post/6844903758942453768
        // log(cdncss.match(/@font-face \{(\n|.)*/im))

        let url: string = ''
        let data = parseGithubUrl('https://github.com/YMC-GitHub/zero-iconfont-hiicon/blob/main/fonts/iconfont.css')
        log(`[info] jsdelivr & github: `, getCdnJsdelivrUrl(data))
        // log(`[info] jsdelivr & npm:`)
        // log(getCdnJsdelivrUrl([...data.slice(0,4),'npm']))

        log(`[info] staticaly & github: `, getCdnJsdelivrUrl(data, '//cdn.staticaly.com'))
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

// tsx ./src/cli.ts file-zise --cmd file-size
// tsx ./src/cli.ts file-zise ./packages/jcm

// tsx ./src/cli.ts css-cdn