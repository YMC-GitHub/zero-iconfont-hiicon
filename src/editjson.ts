

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'

function noop() { }
export function writeJsonFileSync(loc: string, data: any) {
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
export function writeTextFileSync(loc: string, text = '') {
    makedirs(loc)
    // log(`[info] out: ${loc}`)
    writeFileSync(loc, text)
}
export function makedirs(loc: string) {
    let dir = dirname(resolve(loc))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}


export function readJsonFileSync(loc: string, defaultText = '{}') {
    return JSON.parse(readTextFileSync(loc, defaultText))


}

export function readTextFileSync(loc: string, defaultText = '') {
    let text = ''
    try {
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


export function getJsonContextInNs(key: string, json: RootJsonData, sep: string = '') {
    let ns = sep ? key.split(sep) : [key]
    let lastns = ns[ns.length - 1];
    let ctx: any = json;
    if (ns.length > 1) {
        for (let index = 0; index < ns.length - 1; index++) {
            const ki = ns[index];
            let ctxi = ctx[ki]

            // update context ctx    
            if (ctxi) {
                ctx = ctxi
            } else {
                ctx[ki] = {}; ctx = ctx[ki]
            }
            // ctx=ctxi?ctxi:(ctx[ki]={})
        }
    }
    return { context: ctx, lastns }
}

// console.log(iniJsonValueInNs('a.b.c.d','array',{},'.'))
// let json = iniJsonValueInNs('a.b.c.d','number',{},'.')
// console.log(json,JSON.stringify(json,null,0),setJsonValueInNs('a.b.c.d',undefined,json,'.'))

// tsx src/editjson.ts