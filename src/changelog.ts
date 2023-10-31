
// import { Writable,Readable,Duplex,Transform } from 'stream'
import { jsonStreamIo } from './jsonstreamio'
import type { Commitlog } from './commitlog'

import { writeTpl, renderTpl } from './text-plain-template'
import { TextFileIoStream } from './text-file-io-stream'
import { ChanelogFileIoStream } from './changelog-io-stream'
import { ChangelogStyle } from './changelog-style'
import { changelogStylePluginMarkdowntable, changelogStylePluginList } from './changelog-style-builtin'
import { readJsonFileSync, writeJsonFileSync } from './editjson'
// const changelogstyle = new ChangelogStyle()

// register custom plugin to changelogstyle
// changelogstyle.plugin = [ChangelogStylePluginMarkdowntable()]

import { basename, dirname } from "./path"
import { camelize, } from "./string"

import { BaseInfo } from './info'

interface cliOption {
    useEmpty?: boolean
    splitReg: string | RegExp
}


function clihooks2array(s: string | string[], options = {}) {
    let option: cliOption = {
        splitReg: /[,_;| ]/,
        ...options
    }
    let res = Array.isArray(s) ? s : s.split(option.splitReg)
    if (!option.useEmpty) {
        res = res.filter(v => v)
    }
    return res
}



interface LocationToConfigOption {
    trim?: boolean, camelize?: boolean
}

/**
 * 
 * get lib name with working dir
 * @sample
 * ```
 * // 'package/noop' -> 'noop'
 * getLibNameFromPath(`package/noop`)
 * ```
 */
function getLibNameFromPath(wkd: string, option = {}) {
    let res = basename(wkd)
    const opt: LocationToConfigOption = {
        trim: true,
        ...option
    }
    if (opt.trim) {
        res = res.trim()
    }
    if (opt.camelize) {
        res = camelize(res)
    }
    return res
}


/**
 * get lib dir with working dir
 * @param {string} wkd
 * ```
 * // 'package/noop' -> 'package/'
 * getPackagesLocFromPath(`package/noop`)
 * ```
 */
function getPackagesLocFromPath(wkd: string) {
    return dirname(wkd)
}


// @ymc/render-cmted-msgs-to-pkg-changelog

interface RenderOption {
    wkd: string,
    logInfo?: boolean,
    sinceDate?: boolean,
    ignoreTypes?: string
    latestCount: number,
    repo: string
}


/**
 * rendet data to changelog.md text
 */
function render(data: Commitlog[], options = {}) {
    let text
    const option: RenderOption = {
        repo: 'https://github.com/ymc-github/js-idea',
        wkd: './',
        logInfo: false,
        ignoreTypes: 'docs,chore,tool,style,',
        latestCount: 8,
        ...options
    }
    const { wkd } = option

    const libname = getLibNameFromPath(wkd, { camelize: false })
    const libdir = getPackagesLocFromPath(wkd)

    const loginfo = getLogInfo(option.logInfo)
    loginfo('[info] read pkgs pkgjson ')
    const pkgjson = readJsonFileSync(`${libdir}/${libname}/package.json`, '{}')
    // @ts-ignore
    const { version, name } = { version: '0.0.1', ...pkgjson }

    loginfo('[info] grep pkgs commits')
    let cache
    const reg = new RegExp(`${libdir}/${libname}/`, 'i')
    cache = data.filter(v => v.file.some(f => reg.test(f)))
    // cache = gitlog.filterInfoByFile(new RegExp(`${libdir}/${libname}/`, 'i'))

    // log('[info] filter since last commit id')
    // cache = gitlog.filterSinceLastChanglog(cache, lastId)
    // filter:ignore docs
    // cache = gitlog.filterIgnoreScope(cache, docsReg);

    if (option.sinceDate) {
        loginfo('[info] only since date')
    }

    if (option.ignoreTypes) {
        loginfo('[info] filter types with ignore type')
        // cache = cache.filter(v => v.type !== 'docs')
        let ignoretypes = clihooks2array(option.ignoreTypes, { useEmpty: true })
        // ignore empty type
        // ignoretypes.push('')
        cache = cache.filter(v => !ignoretypes.some(vn => v.type === vn))
    }

    if (option.latestCount >= 1 && cache.length > 0) {
        loginfo('[info] only the latet count')
        cache = cache.slice(0, option.latestCount)
    }
    // only the latest
    // if (cache.length > 0) cache = cache[0];

    loginfo('[info] render new changlog')

    // let cmds = definecmds(libname);
    // await runcmds(cmds);

    // get tpl and render
    const changelogstyle = new ChangelogStyle()
    changelogstyle.data = cache
    changelogstyle.option = { style: 'custom' } // table|list|custom
    changelogstyle.plugin = [changelogStylePluginMarkdowntable()]
    // changelogstyle.plugin = [changelogStylePluginList()]

    text = changelogstyle.render()
    // log(text);

    text = changelogstyle.writeTpl(text, {
        version,
        libname: name, // libname,
        repo: 'https://github.com/ymc-github/js-idea'
    })
    // @ts-ignore
    return text.trim()
}


const { log } = console

type TaskFunc = () => unknown
/**
 * chain async task
 */
async function chaintask(tasks: TaskFunc[]) {
    const res: any[] = []
    let chain = Promise.resolve(null)
    // fix Unary operator '++' used       no-plusplus
    /* eslint-disable no-plusplus */
    for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index]
        // fix Unexpected console statement   no-console
        // fix 'v' is defined but never used  no-unused-vars
        /* eslint-disable no-unused-vars,no-console */
        chain = chain
            .then(async v => {
                // feat: save each result to res
                res[index] = await task()
                return res[index]
            })
            .catch(console.log)
    }
    await chain
    return res
}


/**
 * get loginfo function
 */
function getLogInfo(enable?: boolean) {
    return function (...msg: any) {
        if (enable) {
            log(...msg)
        }
    }
}

// todo: param to types

export interface ChangelogOption {
    ignoreTypes?: string
    ignoreSubjects?: string,
    onlyPkgs?: string,
    outPkgs?: boolean
    commitlogLoc: string,
    commipkgLoc: string,
    changelogLoc: string,
    logInfo: boolean,
    logTask: boolean
}


export async function genChangelog(options = {}) {
    const option: ChangelogOption = {
        commitlogLoc: 'commitlog.tmp.json',
        commipkgLoc: 'cmtedpkgs.tmp.json',
        changelogLoc: 'CHANGELOG.md',
        outPkgs: true,
        logInfo: false,
        logTask: false,
        ...options
    }

    const loginfo = getLogInfo(option.logInfo)
    const logtask = getLogInfo(option.logTask)

    let loc: string = ''

    logtask('[task] filter msg for pkg')
    logtask('[task] make changelog with tpl')

    loginfo('[info] read cmted msgs')
    // let cmtedmsgs: Record<string, string | string[]>[]
    let cmtedlogs: Commitlog[]

    loc = option.commitlogLoc
    const changelogio = new ChanelogFileIoStream()
    jsonStreamIo.init(loc)
    cmtedlogs = await jsonStreamIo.read([])

    // sort commitlog with date
    // @ts-ignore
    cmtedlogs = cmtedlogs.sort((a, b) => new Date(b.date) - new Date(a.date))

    function getIgnoreTypes(input: string, builtin: string) {
        let res: string[]
        // let builtin = 'chore,tool,docs,style'
        res = (input ? input : builtin).split(',')
        return res
    }

    // pass --ignore-types 'chore,tool,docs,style' to ignore this types
    if (option.ignoreTypes) {
        let ignoreTypes = getIgnoreTypes(option.ignoreTypes, 'chore,tool,docs,style')
        cmtedlogs = cmtedlogs.filter(v => !ignoreTypes.some(it => it === v.type))
    }
    // pass --ignore-subject 'put changelog,dbg markdown list' to ignore this subject
    if (option.ignoreSubjects) {
        let ignoresubjects = getIgnoreTypes(option.ignoreSubjects, 'put changelog,dbg markdown list')
        // ignoresubjects.push('dbg markdown list')
        cmtedlogs = cmtedlogs.filter(v => !ignoresubjects.some(it => it === v.subject))
    }

    // put changelog
    // dbg markdown list
    loginfo(`[info] src: ${loc}`)
    // log(cmtedmsgs)

    let cmtedpkgs: string[]
    loginfo('[info] read cmted pkgs')
    loginfo(`[info] src: ${loc}`)
    // location -> ['a']
    loc = option.commipkgLoc
    jsonStreamIo.init(loc)
    cmtedpkgs = await jsonStreamIo.read([])


    // ['a' ] -> [{loc:'a'}]
    let stdcmtedpkgs = cmtedpkgs.map(v => ({
        loc: v
    }))

    // pass --only-pkgs 'package/a,package/b' to ignore this pkgs
    if (option.onlyPkgs) {
        let onlyPkgs = getIgnoreTypes(option.onlyPkgs, '')
        stdcmtedpkgs = stdcmtedpkgs.filter(v => onlyPkgs.some(it => v.loc.indexOf(it) >= 0))
    }

    // log(cmtedpkgs)

    loginfo('[info] render cmtedpkgs changelog')
    let pkgschangelogs = stdcmtedpkgs.map(v => {
        // log(v.name, v.loc)
        // res.push(render(data, { wkd: v.loc }))
        const txt: string = render(cmtedlogs, { wkd: v.loc })
        // pkgslogs.push(txt)
        return { loc: v.loc, data: txt }
    })

    loginfo('[info] write cmtedpkgs changelog')
    // pass --out-pkgs true to write changelog to packge/xx location
    if (option.outPkgs) {
        // loginfo('[info] write packages/xx/changelog.md')
        // pkgschangelogs.forEach(v => {
        //     let txt = v.data
        //     // txt = setTableStyle(txt)
        //     writeFileSync(`${v.loc}/${option.changelogLoc}`, txt)
        //     log(`[info] out: ${v.loc}/${option.changelogLoc}`)
        //     // rmSync(`${v.loc}/CHANGELOD.md`)

        //     // TextFileIoStream
        // })
        let task = pkgschangelogs.map(v => {
            return async () => {
                let txt = v.data
                let location = `${v.loc}/${option.changelogLoc}`
                let tio = new TextFileIoStream()
                tio.init(location)
                await tio.write(txt)
                log(`[info] out: ${location}`)
            }
        })
        await chaintask(task)
    }


    loginfo('[info] render root changelog')
    let rootchangelog: string
    pkgschangelogs = pkgschangelogs.filter(v => v)
    // pkgschangelogs = pkgschangelogs.join(`\n`)
    // log(pkgschangelogs)
    rootchangelog = pkgschangelogs.map(v => v.data).join('\n\n')
    // rootchangelog = setTableStyle(pkgschangelogs)

    loginfo('[info] write root changelog')
    loc = option.changelogLoc
    changelogio.init(loc)
    log(`[info] out: ${loc}`)
    await changelogio.write(rootchangelog)
    // rmSync(`CHANGELOD.md`)
}

// tsx src/changelog.ts