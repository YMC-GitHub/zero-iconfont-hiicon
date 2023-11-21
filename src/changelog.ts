
// import { Writable,Readable,Duplex,Transform } from 'stream'
import { jsonStreamIo } from './jsonstreamio'
import type { Commitlog } from './commitlog'

// import { writeTpl, renderTpl } from './text-plain-template'
import { TextFileIoStream } from './text-file-io-stream'
import { ChanelogFileIoStream } from './changelog-io-stream'
import { ChangelogStyle } from './changelog-style'
import { changelogStylePluginMarkdowntable, changelogStylePluginList } from './changelog-style-builtin'
import { readJsonFileSync, writeJsonFileSync } from './editjson'
// const changelogstyle = new ChangelogStyle()

// register custom plugin to changelogstyle
// changelogstyle.plugin = [ChangelogStylePluginMarkdowntable()]
import { clihooks2array, getLibNameFromPath, getPackagesLocFromPath, getLogInfo, chaintask } from './changelog-util'
// import { objectPick, objectSelectKeys, deepClone } from './object'

import { param2usage, usage2param, beautyUsage } from "./cli-param-plugin-usage"

const { log } = console

import { usage } from "./changelog-usage"
import { param } from "./changelog-param"
import type { ChangelogOption } from './changelog-types'


// workflow: define-usage,usage-to-param
// let paramfu = usage2param(usage(), { type: true })

// workflow: define-param,param-to-usage
// paramPluginUsage(param(), { type: true })
// log(paramfu)
import { filterCommitlog } from './commitlog-filter'

interface mdTableRenderOption {
    version: string,
    name: string,
    repo: string,
    style: string
}

function mdtableRender(data: Commitlog[], renderOption: mdTableRenderOption) {
    let { name, version, repo, style } = renderOption
    const changelogstyle = new ChangelogStyle()
    changelogstyle.data = data
    changelogstyle.option = { style: 'custom' } // table|list|custom
    // --render-style table
    // --render-style list
    if (style === 'table') {

        changelogstyle.plugin = [changelogStylePluginMarkdowntable()]
        let text: string = changelogstyle.render()
        //@ts-ignore
        text = changelogstyle.writeTpl(text, {
            version,
            libname: name, // libname,
            repo: repo
        })
        return text.trim()
    }
    changelogstyle.plugin = [changelogStylePluginList()]
    let text: string = changelogstyle.render()
    return text.trim()
}


interface RenderOption {
    wkd: string,
    logInfo?: boolean,
    sinceDate?: boolean,
    ignoreTypes?: string
    latestCount?: number,
    repo: string,
    style: string,
    monoRepo: boolean,
    globy: string,
    projectName?: string,
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
        ignoreTypes: '',//docs,chore,tool,style,
        // latestCount: 8,
        style: 'table',
        monoRepo: true,
        globy: '*',
        projectName: '',
        ...options
    }
    const { wkd } = option

    const libname = getLibNameFromPath(wkd, { camelize: false })
    const libdir = getPackagesLocFromPath(wkd)

    const loginfo = getLogInfo(option.logInfo)
    loginfo('[info] read pkgs pkgjson ')
    const pkgjson = readJsonFileSync(`${libdir}/${libname}/package.json`, '{}')
    // @ts-ignore
    let { version, name } = { version: '0.0.1', ...pkgjson }
    // fix when there is not a package.json
    name = name ? name : option.projectName

    loginfo('[info] grep pkgs commits')
    let cache: Commitlog[]

    // --mono-repo true
    if (option.monoRepo) {
        option.globy = `${libdir}/${libname}/*`
    }
    cache = filterCommitlog(data, option)
    // log(cache)
    loginfo('[info] cmtedlog count (after filter): ', cache.length)

    loginfo('[info] render new changlog')
    text = mdtableRender(cache, { name, version, repo: option.repo, style: option.style })
    return text.trim()
}

// export interface ChangelogOption {
//     ignoreTypes?: string
//     ignoreSubjects?: string,
//     onlyPkgs?: string,
//     outPkgs?: boolean
//     commitlogLoc: string,
//     commitpkgLoc: string,
//     changelogLoc: string,
//     logInfo: boolean,
//     logTask: boolean,
//     monoRepo: boolean,

// }


export async function genChangelog(options: any = {}) {
    const option: ChangelogOption = {
        commitlogLoc: 'commitlog.tmp.json',
        commitpkgLoc: 'cmtedpkgs.tmp.json',
        changelogLoc: 'CHANGELOG.md',
        outPkgs: true,
        logInfo: false,
        logTask: false,
        monoRepo: false,
        ...options
    }

    // --log-info true
    const loginfo = getLogInfo(option.logInfo)

    // --log-tasg true
    const logtask = getLogInfo(option.logTask)

    let loc: string = ''

    // todo: set
    // 'define-usage' | 'get-value-by-name' | 'define-param' | 'define-flags'
    // aa.mode='define-usage'
    // todo: aa.option(`-h,--help type desc true index`)

    // todo: get
    // aa.mode='get-value-by-name';aa.data=options
    // aa.option(`-h,--help type desc true index`)
    // --help true
    if ([options.help, options.h].includes(true)) {
        log(usage())
        return
    }
    // --usage2param true
    if ([options.usage2param].includes(true)) {
        log(usage2param(usage(), { type: true }))
        return
    }


    // let usage = paramPluginUsage(param(), { type: true })
    // log(usage)
    // log(fromUsage(usage, { type: true }))

    logtask('[task] filter msg for pkg')
    logtask('[task] make changelog with tpl')

    loginfo('[info] read cmted msg ')
    // let cmtedmsgs: Record<string, string | string[]>[]
    let cmtedlogs: Commitlog[]

    // --commitlog-loc 'commitlog.tmp.json'
    loc = option.commitlogLoc
    const changelogio = new ChanelogFileIoStream()
    jsonStreamIo.init(loc)
    cmtedlogs = await jsonStreamIo.read([])

    // sort commitlog with date
    if (option.commitlogSortDate) {
        // @ts-ignore
        cmtedlogs = cmtedlogs.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    // log(cmtedlogs)
    loginfo('[info] cmtedlog count: ', cmtedlogs.length)


    // pass --ignore-types 'chore,tool,docs,style' to ignore this types
    // if (option.ignoreTypes) {
    //     let ignoreTypes = getIgnoreTypes(option.ignoreTypes, 'chore,tool,docs,style') //'chore,tool,docs,style'
    //     cmtedlogs = cmtedlogs.filter(v => !ignoreTypes.some(it => it === v.type))
    // }
    // please use --type-omit instead of --ignore-types



    // - pass --ignore-subjects 'put changelog,dbg markdown list' to ignore this subject
    // please use --subject-omit instead of --ignore-subjects
    // if (option.ignoreSubjects) {
    //     let ignoresubjects = getIgnoreTypes(option.ignoreSubjects, 'put changelog,dbg markdown list')
    //     // ignoresubjects.push('dbg markdown list')
    //     cmtedlogs = cmtedlogs.filter(v => !ignoresubjects.some(it => it === v.subject))
    // }

    // log(cmtedlogs)
    // log(cmtedlogs.length)


    // --mono-repo false
    if (!option.monoRepo) {
        // todo: gen changelog text for plain repo
        let plainRepoChangelogText = render(cmtedlogs, { ...option })
        // log(nomonorepotext)
        loginfo('[info] write changelog for plain repo (this repo is not mono repo)')
        loc = option.changelogLoc
        changelogio.init(loc)
        log(`[info] out: ${loc}`)
        await changelogio.write(plainRepoChangelogText)
        return
    }

    let cmtedpkgs: string[]
    loginfo('[info] read cmted pkgs')
    // 'cmtedpkgs.tmp.json' -> ['package/a','package/b']
    loc = option.commitpkgLoc
    loginfo(`[info] src: ${loc}`)
    jsonStreamIo.init(loc)
    cmtedpkgs = await jsonStreamIo.read([])

    loginfo('[info] filter cmted pkgs')
    // filter-order:pick-pik,omit-pkg
    // option.filterOrder.split(",").map(v => v.trim()).filter(v => v)
    cmtedpkgs = cmtedpkgs.filter(location => isOneOfThem(location, option.pickPkg))
    cmtedpkgs = cmtedpkgs.filter(location => !isOneOfThem(location, option.omitPkg))

    loginfo('[info] stdify cmted pkgs')
    // ['package/a'] -> [{loc:'package/a'}]
    let stdcmtedpkgs = cmtedpkgs.map(v => ({
        loc: v
    }))

    // - pass --only-pkgs 'package/a,package/b' to ignore this pkgs
    // if (option.onlyPkgs) {
    //     let onlyPkgs = getIgnoreTypes(option.onlyPkgs, '')
    //     stdcmtedpkgs = stdcmtedpkgs.filter(v => onlyPkgs.some(it => v.loc.indexOf(it) >= 0))
    // }
    // please use --file-pick instead of --only-pkgs
    // eg. --file-pick 'package/a,package/b'
    // eg. --file-pick 'package/*'



    // log(cmtedpkgs)

    loginfo('[info] render cmtedpkgs changelog')
    let pkgschangelogs = stdcmtedpkgs.map(v => {
        // log(v.name, v.loc)
        // res.push(render(data, { wkd: v.loc }))
        const txt: string = render(cmtedlogs, { ...option, wkd: v.loc })
        // pkgslogs.push(txt)
        return { loc: v.loc, data: txt }
    })

    loginfo('[info] write cmtedpkgs changelog')
    // - pass --out-pkgs true to write changelog to packge/xx location
    // + please use --mono-repo instead of --out-pkgs
    if (option.monoRepo) {
        // loginfo('[info] write packages/xx/changelog.md')
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

function getIgnoreTypes(input: string, builtin: string) {
    let res: string[]
    // let builtin = 'chore,tool,docs,style'
    res = (input ? input : builtin).split(',')
    return res
}
function isOneOfThem(one: string, them: string) {
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


// tsx src/changelog.ts