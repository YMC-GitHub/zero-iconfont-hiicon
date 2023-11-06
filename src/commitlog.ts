import { execWraper as exec, execOpts } from './exec'
import type { ExecOption } from './exec'

// import { formatDate } from './date'
import { writeTpl, renderTpl } from './text-plain-template'
import { BaseInfo } from './info'

const info = new BaseInfo()
// info.disableAll=true


/**
 * run git cmd
 */
export async function rungit(cmd: string, execOption: ExecOption) {
    let stdout: string = '';
    let stderr: string = '';
    // @ts-ignore
    ({ stdout, stderr } = await exec(cmd, execOption));
    return stdout
}


/**
 * ini data[key] with val
 * @sample
 * ```
 * let data = {}
 * // {} -> {name:'zero'}
 * inidata(data,'name','zero')
 * ```
 */
export function inidata(data: Record<string, any>, key: string, def: any) {
    // vs !data[key] , !(key in data), data[key] ==undefined || data[key] ==null
    if (!(key in data)) {
        data[key] = def
    }
    return data
}

/**
 * bind val from map to list with keyword
 * @sample
 * ```
 * ```
 */
export function bindVals(list: any[], name = 'subject', map: any[]) {
    if (map.length !== list.length) return false
    // let map = toArray(s);
    const len = list.length
    for (let index = 0; index < len; index += 1) {
        const line = list[index]
        line[`${name}`] = map[index]
    }
    return true
}

function toArray(s: string) {
    return s.trim().split(/\r?\n/)
}




export interface GitCmtJson {
    /**
     * commit id
     */
    commit: string,
    /**
     * the subject of the commit id
     */
    subject: string,
    body: string,
    /**
     * the date of commit
     */
    date: string,
    /**
     * the file of commit
     */
    file: string,
    /**
     * issue number
     */
    issue: string[],
    /**
     * long commit id
     */
    hash: string
}

export interface GitCmtInfo {
    commit: string;
    subject: string[];
    body: string[];
    issue: string[];
    hash: string;
    file: string[];
    date: string;
}

export type PlainObject = Record<string, any>



export interface Commitlog {
    // issue: string;
    issue: string[];
    body: string;
    foot: string;
    type: string;
    scope: string;
    subject: string;
    commit: string;
    hash: string;
    // file: string;
    file: string[];
    date: string;
}

/**
 * @description
 * ```
 * why used?
 * - [x] get git commit-msg data
 * - [x] gen changelog with commit-msg data
 * - [x] gen changelog for monorepo pkg
 * ```
 */
class GitLog {
    infojson: GitCmtInfo[];
    options: PlainObject;
    status: PlainObject;
    meniList: Commitlog[];
    constructor() {
        this.infojson = []
        this.options = {}
        this.status = {}
        this.meniList = []
    }

    set(name: string, list: string[]) {
        const { infojson, status } = this
        // ini data
        if (!status.initeddata) {
            inidata(infojson, name, {})
            status.initeddata = true
        }
        // set
        bindVals(infojson, name, list)
        return this
    }

    /**
     * 
     * @sample
     * ```
     * let tpl:string = 'git log --pretty=format:"%H" --abbrev-commit'
     * //'a' -> 'a -n 3'
     * getTpl(tpl,{n:3})
     * ```
     */
    getTpl(tpl: string, options?: PlainObject) {
        let res = tpl
        // get option from func-level,cls-level
        let option = options ? {
            ...options,
            ...this.options
        } : this.options;

        if (option.n) {
            res = `${tpl} -n ${option.n}`
        }
        return res
    }

    /**
     * get git commit hash
     * @sample
     * ```
     * tpl='git log --pretty=format:"%H" --abbrev-commit'
     * ```
     */
    async getHash() {
        let tpl
        let cmd
        let res
        tpl = 'git log --pretty=format:"%H" --abbrev-commit' // %h
        tpl = this.getTpl(tpl)
        // -n 1
        cmd = renderTpl(tpl, {})
        res = await rungit(cmd, execOpts)
        return res
    }

    /**
     * get git commit msg subject
     * @sample
     * ```
     * tpl = 'git log --pretty=format:"%s" --abbrev-commit'
     * ```
     */
    async getSubject() {
        let tpl
        let cmd
        let res
        tpl = 'git log --pretty=format:"%s" --abbrev-commit'
        tpl = this.getTpl(tpl)

        cmd = renderTpl(tpl, {})
        res = await rungit(cmd, execOpts)
        return res
    }

    /**
     * get git commit msg body
     * @sample
     * ```
     * tpl = 'git log --pretty=format:"%b"'
     * ```
     */
    async getBody() {
        let tpl
        let cmd
        let res
        tpl = 'git log --pretty=format:"%b"'
        tpl = this.getTpl(tpl)

        cmd = renderTpl(tpl, {})
        res = await rungit(cmd, execOpts)
        return res
    }

    /**
     * get git commit author date
     * @description
     * ```
     * //author date vs commit date?
     * tpl = 'git log --pretty=format:"%as"'
     * ```
     */
    async getDate() {
        let tpl
        let cmd
        let res
        /// /git log --format=format:"%ai, %ci %aE %s"
        tpl = 'git log --pretty=format:"%as"' // %cs %ci %as %ai
        tpl = this.getTpl(tpl)

        cmd = renderTpl(tpl, {})
        res = await rungit(cmd, execOpts)
        return res
    }

    /**
     * get git commit files or other info in a commit
     * @sample
     * ```
     * // get file in a commit
     * let hash = await it.getHash()
     * hash=toArray(hash)
     * let tpl = 'git show --pretty="" --name-only {commit}'
     * await it.getFile(hash,tpl)
     * // get msg body in a commit
     * let body = await this.getFile(hash, `git log --pretty=format:"%b" {commit}`);
     * body = body.map(v=>v.join("\n"))
     * // work-flow: each-hash -> get-in-commit -> to-array
     * ```
     */
    async getFile(hashList: string[], tpl?: string) {
        // let { infojson } = this;
        let defalutTpl = 'git show --pretty="" --name-only {commit}'
        // defalutTpl = this.getTpl(defalutTpl)

        const res = []
        for (let index = 0; index < hashList.length; index += 1) {
            const commit = hashList[index]
            const file = await getFilesInCommit(commit) // no-await-in-loop
            if (file) {
                res.push(toArray(file))
            }
        }
        return res
        async function getFilesInCommit(commit: string) {
            const cmd = renderTpl(tpl ? tpl : defalutTpl, { commit })
            // if (tpl) console.log(cmd);
            return rungit(cmd, execOpts)
        }
    }

    /**
     * get commit msg info
     */
    async getinfo() {
        let hash: string[]
        let subject: string[]
        let body: string[]
        let file: string[][];
        let date: string[]


        hash = toArray(await this.getHash())
        subject = toArray(await this.getSubject())
        // body = toArray(await this.getBody());

        let tpl: string = ''
        tpl = 'git log -n 1 --pretty=format:"%b" {commit}'
        // tpl = this.getTpl(tpl)

        // getBody
        info.record('s:get-body')
        body = (await this.getFile(hash, tpl)).map(item => item.join('\n'))
        // console.log(body)
        info.record('e:get-body')

        info.record('s:get-date')
        date = toArray(await this.getDate())
        info.record('e:get-date')

        info.record('s:get-file')
        file = await this.getFile(hash)
        // console.log(file)
        info.record('e:get-file')


        // log(body);
        // return [];
        // return {hash,subject,body,date,file}
        info.record('s:get-info')
        let res
        res = hash.map((item, index) => {
            // const menifest = parsemsg(subject[index], body[index])
            let issue = ['']
            // getIssueInFoot(menifest.foot)
            return {
                commit: item.slice(1, 10),
                subject,
                body,
                // ...menifest,
                issue,
                hash: item,
                file: file[index],
                date: date[index] // date[index].split(" ")[0], //2022-08-09 00:00:00 +8000
            }
        })
        this.infojson = res
        info.record('e:get-info')
        // info.printAll()
        return res
    }

    /**
     * get commit msg info -parsed subject and body
     */
    async parse(allowTypes = '') {
        let data = await this.getinfo()
        // console.log(data)
        // log(`[task] parse gitlog`)

        // let allowTypes = ''
        let meniList = data.map((item, index) => {
            let { subject, body, file } = item
            const menifest = parse(subject[index], body[index], allowTypes)
            info.record('s:get-issue')
            let issue = getIssueInFoot(menifest.foot)
            info.record('e:get-issue')

            // file
            return {
                ...item,
                ...menifest,
                issue
            }
            // let res:any= {
            //     ...item,
            //     ...menifest,
            //     issue
            // }
            // Object.keys(res).forEach(key=>{
            //     let val =res[key]
            //     res[key]= Array.isArray(val)?val.join(","):val
            // })
            // return res
        })
        // console.log(meniList)
        this.meniList = meniList
        return meniList
    }

    flatMenilist() {
        let meniList = this.meniList
        return meniList.map(ml => {
            let pick = {
                file: strify(ml.file),
                issue: strify(ml.issue)
            }
            let res = { ...ml, ...pick }
            // let res:any={}
            // Object.keys(ml).forEach(key=>{
            //     res[key]= strify(ml[key])
            // })
            return res
        })
        function strify(v: string | string[]) {
            return Array.isArray(v) ? v.join(",") : v
        }
    }

    /**
     * filter info by file
     * @sample
     * ```
     * store.filterInfoByFile(new RegExp(`packages/${libname}/`, "i"))
     * // todo: store.globy('package/noop')
     * // store-filter-globy
     * ```
     */
    filterInfoByFile(reg = /.*/i) {
        const { infojson } = this
        return infojson.filter(item => {
            if (item && item.file) {
                return item.file.some(file => reg.test(file))
            }
            return false
        })
    }
    //

    /**
     * filter info since last commit id
     */
    filterSinceLastChanglog(data: GitCmtJson[], lastId: string) {
        const cache = []
        for (let index = 0; index < data.length; index += 1) {
            const item = data[index]
            if (item.commit === lastId) {
                break
            }
            cache.push(item)
        }
        return cache
    }
}


// git-commit-msg-parse

/**
 * get type in subject
 * @sample
 * ```
 * // 'feat(run-bash): change all thing' -> 'feat'
 * getTypeInSubject(`feat(run-bash): change all thing`) //feat
 * ```
 */
export function getTypeInSubject(subject: string, allowTypes: string | string[]) {
    // with scope
    const reg = /\(.*\):?/gi
    const match = subject.match(reg)
    if (match) {
        return subject.split(':')[0].replace(reg, '')
    }

    // without scope
    let res = subject
        .split(' ')[0]
        .trim()
        .replace(/\(.*\):?/gi, '')
        .trim()

    if (!isValidType(res, allowTypes)) {
        res = ''
    }
    return res
}



/**
 * is valid type
 * @sample
 * ```
 * isValidType('feat') //true
 * isValidType('feat','feat|fix|docs|style|refactor|preform|test|tool|chore|revert') //true
 * ```
 */
export function isValidType(type: string, validTypes: string | string[] = '') {
    let builtinTypes = 'feat|fix|docs|style|refactor|preform|test|tool|chore|revert'
    let types: string[]
    // types = Array.isArray(validTypes)?validTypes:typeStrArrify(typeStrChoose(validTypes,builtinTypes))
    types = typeArrify(validTypes, (s) => typeStrArrify(typeStrChoose(s, builtinTypes)))
    return oneOf(type, types)

    function typeArrify(s: string | string[], arrify: (s: string) => string[]) {
        return Array.isArray(s) ? s : arrify(s)
    }
    function typeStrChoose(custom: string, builtin: string) {
        return custom == '' ? builtin : custom
    }
    function typeStrArrify(s: string) {
        return s.split('|').map(v => v.trim()).filter(v => v)
    }
    function oneOf(one: any, list: any[]) {
        return list.some(v => v === one)
    }

}

/**
 * get scope in subject
 * @sample
 * ```
 * // `feat(run-bash): change all thing` -> 'run-bash'
 * getScopeInSubject(`feat(run-bash): change all thing`) //run-bash
 * ```
 */
export function getScopeInSubject(subject: string = '') {
    const match = subject.match(/\(.*\)/gi)
    let res = ''
    if (match) {
        ;[res] = match
    }
    // '(a)' -> 'a'
    res = res.replace(/(^\(|\)$)/gi, '')
    return res
}


interface BodyFoot {
    body: string,
    foot: string
}


/**
 *
 * @param {string} text
 * @returns {{body:string,foot:string}}
 * @sample
 * ```
 * // 'overide exec function args\nCLOSING ISSUE #1' -> {body:"overide exec function args",foot:"CLOSING ISSUE #1"}
 * parseMsgBody(`overide exec function args\nCLOSING ISSUE #1`)
 * //{body:"overide exec function args",foot:"CLOSING ISSUE #1"}
 * ```
 */
export function parseMsgBody(text = '') {
    let res: BodyFoot = { body: text, foot: '' }
    let body: string
    let list: string[]
    // '\\n' -> '\n'
    body = text.replace(/\\\\n/gi, '\n')

    list = toArray(body)

    // log(list, body);
    // let b:number=-1
    // let c:number=-1
    // let d:number=-1
    // for (let index = 0; index < list.length; index += 1) {
    //     const line = list[index]
    //     // breaking change
    //     if (!isMatch(b) && line.match(/^BREAKING CHANGE/i)) {
    //         b = index
    //     }
    //     // closing issue
    //     if (!isMatch(c) && line.match(/^CLOSING ISSUE/i)) {
    //         c = index
    //     }
    //     // generated by
    //     if (!isMatch(d) && line.match(/^generated by/i)) {
    //         d = index
    //     }
    //     if (isMatch(c) && isMatch(b) && isMatch(d)) {
    //         break
    //     }
    // }

    // // get max
    // let s = -1
    // if (!isMatch(c)) {
    //     c = -1
    // }
    // if (!isMatch(b)) {
    //     b = -1
    // }
    // if (!isMatch(d)) {
    //     d = -1
    // }
    // s = Math.max(c, b, d)

    // log(`---------------${s}`);

    let keyIndexList = getKeyIndex(list, 'BREAKING CHANGE,CLOSING ISSUE,generated by')
    let s = maxKeyIndex(keyIndexList)

    // key is match
    // if (s >= 0 && s <= list.length) {
    //     // res = list.slice(s).join("\n");
    //     res.foot = list.slice(s).join('\n').trim()
    //     if (s > 0) {
    //         res.body = list.slice(0, s).join('\n').trim()
    //     } else {
    //         res.body = ''
    //     }
    // }
    res = getDataByKeyIndex(res, list, s)
    return res


    function isMatch(c: number) {
        return c !== -1
    }

    // todo:
    function getKeyIndex(lines: string[], keys?: string) {
        let their = keys ? keys : 'BREAKING CHANGE,CLOSING ISSUE,generated by'
        // arrify
        let keyarr = their.split(",").map(v => v.trim()).filter(v => v)
        // regify
        let keyreg = keyarr.map(key => new RegExp(`^${key}`, 'i'))

        let matches: number[] = Array(keyarr.length).fill(-1)
        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index]
            for (let j = 0; j < matches.length; j++) {
                const v = matches[j];
                if (!isMatch(v) && line.match(keyreg[j])) {
                    matches[j] = index
                }
                // all is match 
                if (matches.every(m => isMatch(m))) {
                    break
                }


            }
        }
        return matches
    }
    function maxKeyIndex(index: number[]) {
        return Math.max(...index)
    }

    function getDataByKeyIndex(res: BodyFoot, list: string[], keyIndex: number) {
        // let res:BodyFoot={body:'',foot:''}

        if (keyIndex >= 0 && keyIndex <= list.length) {
            // res = list.slice(s).join("\n");
            // foot is from s to end
            res.foot = list.slice(keyIndex).join('\n').trim()
            // foot is from start to s
            res.body = list.slice(0, keyIndex).join('\n').trim()
        }
        return res
    }
}

/**
 *
 * ```
 * // `CLOSING ISSUE #1` -> ['#1']
 * 
 * //no:
 * getIssueInFoot(`CLOSING ISSUE #1,#2`) //['#1','#2']
 * 
 * //ok:
 * //please: one issue one commit
 * //keep 'one issue one commit' is good !
 * getIssueInFoot(`CLOSING ISSUE #1`) //['#1']
 * ```
 */
export function getIssueInFoot(foot: string, issueReg = /#\d+/gi) {
    let res: string[] = []
    const match = foot.match(issueReg)
    if (match) {
        res = match
    }
    return res
}


/**
 * parse commit msg (anglur-style)
 */
export function parse(msg: string, msgBody: string, allowTypes: string) {
    let type
    let scope
    let subject
    let body
    let foot

    // get body in msg
    info.record('s:get-body')
    if (msgBody) {
        // swap subject and body
        ;[subject, body] = [msg, msgBody]
        // (subject = msg), (body = msgb);
    } else {
        // get subject and body (rough)
        const list = fixmsg(msg)
            ;[subject] = list
        body = list.slice(1).join('\n')
        // feat: set subject as body when no body or body in subject
        if (!body) body = subject
    }
    info.record('e:get-body')

    info.record('s:get-foot')
    // get type,scope,subject,body,foot (detail)
    const base = parseMsgBody(body);
    // ({body,foot}=base);
    // console.log(subject, body, base);
    info.record('e:get-foot')


    info.record('s:get-type')
    type = getTypeInSubject(subject, allowTypes)
    info.record('e:get-type')

    info.record('s:get-scope')
    scope = getScopeInSubject(subject)
    info.record('e:get-scope')

    info.record('s:min-subject')
    // slim subject
    // idea:del-type -> del-scope -> trim
    subject = slimSubject(subject, type)
    info.record('e:min-subject')

    return {
        type,
        scope,
        subject,
        ...base
        // body,
        // foot
    }

    // fix:fix msg when escape \n with \\n
    function fixmsg(s: string) {
        return s
            .trim()
            .split(/\r?\n/)
            .map(v => v.trim().split('\\n'))
            .flat(1)
            .map(v => v.trim())
    }
    function slimSubject(subject: string, type: string) {
        return subject
            .replace(type, '')
            .replace(/\(.*\):?/i, '')
            .trim()
    }
}



import { jsonStreamIo } from "./jsonstreamio"

class PlainStore {
    cache: PlainObject[] = []
    constructor() {
    }
    exist(value: PlainObject) {
        let { cache: store } = this
        return store.some(vInStore => vInStore.hash === value.hash)
    }
    prepend(value: PlainObject) {
        let { cache: store } = this
        store.unshift(value)
        return this.cache
        // if (!this.exist(value)) {

        // }
    }
    update(recieve: PlainObject[]) {
        recieve.forEach(vInRecieve => {
            if (!this.exist(vInRecieve)) {
                this.prepend(vInRecieve)
            }
        })
        return this.cache
    }
    load(store: PlainObject[]) {
        this.cache = store
    }
    /**
     * make a new instance
     */
    // @ts-ignore
    new(...option) {
        // @ts-ignore
        return new JsonStreamIo(...option)
    }

}


// git-cmt-msg-to-json
// changelog
export async function gitcmtmsgJsonify(location: string = '', count: number = 30, countall: boolean) {
    const { log } = console
    const gitlog = new GitLog()
    const plainStore = new PlainStore()
    // 
    // log('[task] read gitlog')
    // const data = await gitlog.getinfo()
    // // log(data)

    // log('[task] store gitlog')
    // const loc = 'gitlog-info.tmp.json'
    // jsonstream.init(loc)
    // await jsonstream.write(data)
    // log(`[info] out: ${loc}`)

    log('[task] update gitlog')

    // log('[info] read gitlog')
    log('[info] read the last gitlog')
    if (countall) {
        // gitlog.options.n=undefined
    } else {
        gitlog.options.n = count ? count : 10
    }
    const data = await gitlog.parse()
    // log(data)
    log('[info] gitlog length of parsing: ', data.length)


    // READ -> UPDATE  -> WRITE
    // data flow: location -> string -> json -> string -> location
    let o: PlainObject[]
    log('[info] read,update,write gitlog')
    // location -> string -> json
    // const loc = process.argv[2]?process.argv[2]:'gitlog-info.shim.tmp.json'
    const loc = location ? location : 'gitlog-info.shim.tmp.json'

    jsonStreamIo.init(loc)
    o = await jsonStreamIo.read([])
    plainStore.load(o)
    o = plainStore.update(data)
    await jsonStreamIo.write(o)
    log('[info] gitlog length: ', o.length)
    log(`[info] out: ${loc}`)

}
