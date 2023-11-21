

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'

function noop() { }

/**
 * 
 * @sample
 * ```
 * readJsonFileSync('./package.json','{}')
 * 
 * readJsonFileSync('./package.json',{})
 * ```
 */
export function writeJsonFileSync(loc: string, data: any) {
    // feat(core): parse js object to json-format string 
    let text: string = typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
    writeTextFileSync(loc, text)
}

// export util for sharing to other files or package
// when they are too much, move them to anoter file or package
export function writeTextFileSync(loc: string, text = '') {
    makedirs(loc)
    // log(`[info] out: ${loc}`)
    writeFileSync(loc, text)
}
export function makedirs(loc: string) {
    // feat(core): make dirs when location 's parent dir not exit
    let dir = dirname(resolve(loc))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/**
 * 
 * @sample
 * ```
 * readJsonFileSync('./package.json','{}')
 * 
 * readJsonFileSync('./package.json',{})
 * ```
 */
export function readJsonFileSync(loc: string, data: any = '{}') {
    // feat(core): data to string when data is js object
    // feat(core): parse json-format string to js object
    let defaultText = typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
    let text: string = readTextFileSync(loc, defaultText)
    return JSON.parse(text)
}

export function readTextFileSync(loc: string, defaultText = '') {
    // feat(core): return default text when location not exits
    // feat(core): return default text when reading location but error
    let text = defaultText
    if (!existsSync(loc)) return text
    try {
        // why try catch ? when location is binary file may be fail.
        text = readFileSync(loc).toString()
    } catch (error) {
        text = defaultText
    }
    return text
}

// editjson-transform-sortkeys
export function sortJsonByKeys(json: any, keys: string) {
    // str-to-arr,trim,no-empty
    let arr = keys.split(',')
    arr = arr.map(v => v.trim()).filter(v => v)

    let otherkeys = Object.keys(json).filter(a => !arr.includes(a))
    let res: any = {}
    res = assignValueByKey(res, arr, json)
    res = assignValueByKey(res, otherkeys, json)
    return res
}
function assignValueByKey(res: any, arr: string[], json: any) {
    for (let index = 0; index < arr.length; index++) {
        let key = arr[index]
        res[key] = json[key]
    }
    return res
}

// editjson-plugin-pickkeys
export function selectValueByKeys(json: any, keys: string) {
    // str-to-arr,trim,no-empty
    let arr = keys.split(',')
    arr = arr.map(v => v.trim()).filter(v => v)

    let res: any = {}
    for (let index = 0; index < arr.length; index++) {
        let key = arr[index]
        res[key] = json[key]
    }
    return res
}


// editjson-transform-keywrods
export interface EditKeywordOption {
    include: string,
    exclude: string,
    sep: string,
    ns: string
}
export type EditKeywordOptionLike = Partial<EditKeywordOption>
const builtinEditKeywordOption = { include: '', exclude: '', sep: ',', ns: 'keywords' }
export function editKeywords(data: any, opts?: EditKeywordOptionLike) {
    let buitinOption: EditKeywordOption = builtinEditKeywordOption
    let option = opts ? { ...buitinOption, ...opts } : buitinOption
    let { include, exclude, sep, ns } = option
    let dataInNs = data[ns]
    let res: string[] = dataInNs ? dataInNs : []
    res = kwInclude(res, kwArrify(include, sep))
    res = kwExclude(res, kwArrify(exclude, sep))
    res = kwDup(res)
    res = kwIgnoreEmpty(res)
    // update to data
    data[ns] = res
    // return {keywords:res,json:data}
    return res
}

function kwArrify(s: string, sep: string = ',') {
    return s.split(sep)
}
function kwInclude(cur: string[], toadd: string[]) {
    return [...cur, ...toadd]
}
function kwExclude(cur: string[], todel: string[]) {
    return cur.filter(v => !todel.includes(v))
}
function kwDup(cur: string[]) {
    return Array.from(new Set([...cur]))
}
function kwIgnoreEmpty(cur: string[]) {
    return cur.filter(v => v !== '')
}

// editjson-transform-name
export interface EditNameOption {
    ns: string
    org: string,
    name: string,
}
export type EditNameOptionLike = Partial<EditNameOption>
const builtinEditNameOption = { org: '', name: '', ns: 'name' }

export function editName(data: any, opts?: EditNameOptionLike) {
    let buitinOption: EditNameOption = builtinEditNameOption
    let option = opts ? { ...buitinOption, ...opts } : buitinOption
    let { name, org, ns } = option
    let dataInNs = data[ns]
    let res: string = dataInNs ? dataInNs : ''
    data[ns] = genPkgName(option)
    return res
}

function genPkgName(data: EditNameOptionLike) {
    let { name, org } = data
    return org ? `@${org}/${name}` : name
}


// editjson-transform-github
export interface EditRepoOption {
    user: string
    repo: string,
    name?: string,
    packageLoc?: string,
    branch?: string,
    mono?: boolean
}
export type EditRepoOptionLike = Partial<EditRepoOption>
const builtinEditRepoOption = { user: '', repo: '', name: '', mono: false, branch: 'main', packageLoc: 'packages' }
export function editRepo(data: any, opts?: EditRepoOptionLike) {
    let buitinOption: EditRepoOption = builtinEditRepoOption
    let option = opts ? { ...buitinOption, ...opts } : buitinOption
    let { user, repo, name, mono } = option
    if (mono) {

    }
    let text = ['https://github.com', user, repo].join('/')

    data['repository'] = {
        "type": "git",
        "url": `git+${text}.git`
    },
        data['bugs'] = {
            "url": `${text}/issues`
        },
        data['homepage'] = mono ? `${text}/${getMonoHomePageSuffix(option)}#readme` : `${text}#readme`

}
function getMonoHomePageSuffix(data: EditRepoOptionLike) {
    let { branch, packageLoc, name } = data
    return ['blob', branch, packageLoc, name].join("/")
}

type RootJsonData = Record<string, any>

/**
 * 
 * @sample
 * ```
 * setJsonValueInNs('a.b.c.d','array',{},'.') //{ a: { b: { c: 'array' } } }
 * ``` 
 */
export function setJsonValueInNs(key: string, value: any, json: RootJsonData, sep: string = '') {
    let { lastns, context } = getJsonContextInNs(key, json, sep)

    if (value === undefined) {
        // del ns when set it as undefined
        delete context[lastns]
    } else {
        context[lastns] = value
    }

    return json
}

/**
 * 
 * @sample
 * ```
 * iniJsonValueInNs('a.b.c.d','array',{},'.') //{ a: { b: { c: [Object] } } }
 * ``` 
 */
export function iniJsonValueInNs(key: string, type: string, json: RootJsonData, sep: string = '') {
    let { lastns, context } = getJsonContextInNs(key, json, sep)
    let noop = () => { }

    // no need initing when exist in it
    if (lastns in context) {
        // do nothing
        noop()
    } else {
        context[lastns] = iniValueByType(type)
    }
    return json
}

export function iniValueByType(type: string) {
    let res: any
    switch (type.trim().toLowerCase()) {
        case 'hash':
            res = {}
            break;
        case 'array':
            res = []
            break;
        case 'bool':
            res = false
            break;
        case 'number':
            res = 0
            break;
        case 'string':
        default:
            res = ''
            break;
    }
    return res
}
// '{},[],false,0,""'.split(",").map(v=>JSON.parse(v)).map(v=>console.log(v))


// export function getJsonContextInNs(key: string, json: RootJsonData, sep: string = '') {
//     let ns = sep ? key.split(sep) : [key]
//     let lastns = ns[ns.length - 1];
//     let ctx: any = json;
//     if (ns.length > 1) {
//         for (let index = 0; index < ns.length - 1; index++) {
//             const ki = ns[index];
//             let ctxi = ctx[ki]

//             // update context ctx    
//             if (ctxi) {
//                 ctx = ctxi
//             } else {
//                 ctx[ki] = {}; ctx = ctx[ki]
//             }
//             // ctx=ctxi?ctxi:(ctx[ki]={})
//             // todo: names[0]
//             // let arrIndexInKi = getKeyArrayIndex(ki)
//             // if (arrIndexInKi != null) {
//             //     ctx = ctx[arrIndexInKi]
//             // }
//         }
//     }
//     return { context: ctx, lastns }
// }


export function getJsonContextInNs(key: string, ctx: RootJsonData, sep: string = '.', loopEnd: number = -1) {
    let keys = nsStd(key, sep)
    let root = ctx
    // let loopEnd = -1;


    // get loop end
    function getLastIndex(length: number, loopEnd: number) {
        return loopEnd > 0 ? length - loopEnd : length + loopEnd
    }
    let end = getLastIndex(keys.length, loopEnd);
    for (let index = 0; index < end; index++) {
        let cur = keys[index]
        let next = keys[index + 1]
        // '[0]' -> '0'
        let name = nsPureName(cur)
        ctxIniCurVal(ctx, name, next)
        ctx = ctx[name]
    }

    // console.log(keys)
    let last = nsPureName(keys[end])

    // let tmp = ctxIniNs(ctx, key)
    // return tmp
    return { context: ctx, lastns: last }
}
function isKeyArrayIndex(s: string) {
    return /\[\d+\]/.test(s)
}
// 'names[0]' -> '0'
function getKeyArrayIndex(s: string) {
    let res: string = ''
    let match = s.match(/\[\d+\]/)
    if (match) {
        res = res.replace(/\[|\]/, '')
    }
    // return res ? Number(res) : null        
    return res ? res : null
}

function getKeyArrKey(s: string) {
    //names[0] -> names
    return s.replace(/\[\d+\]/, '')
}
function keyarrObjify(s: string) {
    return { key: getKeyArrKey(s), index: getKeyArrayIndex(s) }
}

/**
 * 
 * @sample
 * ```
 * //'names[0]' -> ['[0]']
 * nsGetMatch('names[0]')
 * 
 * //'names[0][1]' -> ['[0]','[1]']
 * nsGetMatch('names[0][1]')
 * //'names' -> null
 * nsGetMatch('names')
 * 
 * //'names[zero]' -> ['[zero]']
 * nsGetMatch('names[zero]')
 * 
 * //'names[zero]' -> null
 * nsGetMatch('names[zero]', /\[\d+\]/g)
 * ``` 
 */
export function nsGetMatch(s: string, reg: RegExp = /\[[^\s\[\]]+\]/g, preset: string | string[] = '') {
    let regf = Array.isArray(preset) ? preset : preset.split(',').map(v => v.trim()).filter(v => v)
    // only-number,allow-string
    let regp: RegExp | null = null
    if (regf.includes('only-number')) {
        regp = /\[\d+\]/g
    }
    if (regf.includes('allow-string')) {
        regp = /\[[^\s]+\]/g
    }
    // a- > b
    // 
    // /\[[^\s]+\]/g -> /\[[^\s\[\]]+\]/g
    let match = s.match(regp ? regp : reg)
    return match
}

/**
 * 
 * @sample
 * ```
 * //'names[zero]' ->  ['names','[zero]']
 * nsStd('names[zero]', /\[[^\s]+\]/g)
 * ``` 
 */
export function nsStd(s: string, sep: string = '.', reg: RegExp = /\[[^\s\[\]]+\]/g) {
    let tmp: string[] = nsStdDotTypeKey(s, sep)
    let res: string[] = []
    for (let index = 0; index < tmp.length; index++) {
        const item = tmp[index];
        let arrTypeify = nsStdArrTypeKey(item, reg)
        res.push(...arrTypeify)
    }
    return res
}

export function nsStdArrTypeKey(s: string, reg: RegExp = /\[[^\s\[\]]+\]/g) {
    //'[0][0][1] -> ['[a]', '[b]', '[c]']
    let match = nsGetMatch(s)
    let head = s.replace(reg, '')
    return match ? [head, ...match] : [head]
}
/**
 * 
 * @sample
 * ```
 * //'names.a.b.c' -> ['names.a.b.c']
 * nsStdDotTypeKey('names.a.b.c', ',')
 * //'names.a.b.c' -> [ 'names', 'a', 'b', 'c' ]
 * nsStdDotTypeKey('names.a.b.c', '.')
 * ``` 
 */
export function nsStdDotTypeKey(s: string, sep: string = '.') {
    //'a.b.c -> ['a', 'b', 'c']
    let res: string[]
    if (sep) {
        res = s.split(sep).map(v => v.trim()).filter(v => v)
    } else {
        res = [s]
    }
    return res
}


/**
 * 
 * @sample
 * ```
 * // {} -> { names: {} }
 * ctxIniCurVal({}, 'names', '[zero]') // { names: {} }
 * 
 * // {} -> { names: [] }
 * ctxIniCurVal({}, 'names', '[0]') // { names: []}
 * ``` 
 */
export function ctxIniCurVal(ctx: any, cur: string, next: string) {
    if (!ctx[cur]) {
        let pn = nsPureName(next)
        if (/\[\d+\]/g.test(next)) {
            //[0]
            ctx[cur] = []
        } else if (/\[[^\s\[\]]+\]/g.test(next)) {
            //[zero]
            ctx[cur] = {}
        } else if (/^\d+$/.test(pn)) {
            // 0
            ctx[cur] = []
        }
        else {
            ctx[cur] = {}
        }

    }
    return ctx
}

/**
 * 
 * @sample
 * ```
 * // {} -> { names: {} }
 * ctxIniNs({}, 'names[zero]') // { names: {} }
 * 
 * // {} -> { names: [] }
 * ctxIniNs({}, 'names[0]') // { names: []}
 * 
 * //return ctx at key
 *  ctxIniNs({}, 'names[0]','ctx') // []
 * ``` 
 */
export function ctxIniNs(ctx: any, ns: string | string[], returnValue: 'root' | 'ctx' = 'root', loopEnd: number = -1, mode: 'ini-ctx-before-last' | 'get-ctx-before-last' | 'ini-ctx-at-last' | 'get-ctx-at-last' | 'set-val-at-last' | 'unknow' = 'unknow') {
    let keys = Array.isArray(ns) ? ns : nsStd(ns)
    let root = ctx
    // let loopEnd = -1;

    // update loopEnd and returnValue with mode !=='unknow'
    switch (mode) {
        case 'get-ctx-at-last':
            loopEnd = -1
            returnValue = 'ctx'
            break;
        case 'ini-ctx-at-last':
            loopEnd = -1
            break;
        case 'get-ctx-before-last':
            loopEnd = -2
            returnValue = 'ctx'
            break;
        case 'ini-ctx-before-last':
            loopEnd = -2
            break;

        case 'unknow':
        default:
            break;
    }

    // get loop end
    function getLastIndex(length: number, loopEnd: number) {
        return loopEnd > 0 ? length - loopEnd : length + loopEnd
    }
    let end = getLastIndex(keys.length, loopEnd);
    for (let index = 0; index < end; index++) {
        let cur = keys[index]
        let next = keys[index + 1]
        // '[0]' -> '0'
        let name = nsPureName(cur)
        ctxIniCurVal(ctx, name, next)
        ctx = ctx[name]
    }

    // let last = keys[end]
    // console.log(last, ctx[last])
    // if (ctx[last]) {
    //     ctx = ctx[last]
    // } else {
    //     ctx[last] = val
    //     ctx = ctx[last]
    // }
    // ctx = ctxIniKey(ctx, last, val)
    // ctx = ctxIniKey(ctx, nsPureName(last), val)
    return returnValue == 'ctx' ? ctx : root
}

export function ctxIniKey(ctx: any, key: string, def: any = {}) {
    // let last = keys[end]
    // console.log(key, ctx[key])
    if (ctx[key]) {
        ctx = ctx[key]
    } else {
        ctx[key] = def
        ctx = ctx[key]
    }
    return ctx
}
/**
 * 
 * @sample
 * ```
 * '[0]' -> '0'
 * nsPureName('[0]')
 * ```
 */
export function nsPureName(s: string) {
    return s.replace(/[\[\]]/g, '')
}

export function jsoninline(a: any) {
    return JSON.stringify(a, null, 0)
}

// const { log } = console

// let root = {}
// let key: string
// let ctx: any
// let val: any
// key = 'names[0].CN'; val = {};
// let { context, lastns } = getJsonContextInNs(key, root, '.', -1)
// context[lastns] = 'AA'
// log(root)


// root = {}
// ctx = ctxIniNs(root, 'c.a.0.c.d', {}, 'ctx')
// ctx.name = 'i am in d'
// log(ctx)

// log(jsoninline(root))
// log(nsStd('names.a.0.c'))

// log(ctxIniNs(root, 'names[0][1][2]', 'ctx'))
// log(root)
// log(nsStd('names[0][1][2]'))


// todo:
// log(nsStdDotTypeKey('names.a.b.c', ''))


// log(ctxIniNs({}, 'names[0][]', 'ctx', -1))
// log(ctxIniCurVal({}, 'names', '[0]'))
// log(nsStd('names[zero]', /\[[^\s]+\]/g))

// console.log(iniJsonValueInNs('a.b.c.d','array',{},'.'))
// let json = iniJsonValueInNs('a.b.c.d','number',{},'.')
// console.log(json,JSON.stringify(json,null,0),setJsonValueInNs('a.b.c.d',undefined,json,'.'))

// tsx src/editjson.ts