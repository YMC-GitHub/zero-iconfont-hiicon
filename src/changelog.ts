
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
import { objectPick, objectSelectKeys, deepClone } from './object'

import { paramPluginUsage } from "./cli-param-plugin-usage"
const { log } = console

// @ymc/render-cmted-msgs-to-pkg-changelog


interface CommitlogFilterOption {
    version: string,
    name: string,
    repo: string,
    style: string
}

function filterData(data: Commitlog[], option: any) {

    const loginfo = getLogInfo(option.logInfo)

    loginfo('[info] grep pkgs commits')
    let cache: Commitlog[] = data.map(v => deepClone(v))


    // --globy package/noop/*
    // const reg = new RegExp(`${libdir}/${libname}/`, 'i')
    // cache = data.filter(v => v.file.some(f => reg.test(f)))
    // cache = gitlog.filterInfoByFile(new RegExp(`${libdir}/${libname}/`, 'i'))
    if (option.globy) {
        let reg = new RegExp(option.globy.replace('*', '.*'), 'i')
        cache = data.filter(v => v.file.some(f => reg.test(f)))
    }

    // log('[info] filter since last commit id')
    // cache = gitlog.filterSinceLastChanglog(cache, lastId)
    // filter:ignore docs
    // cache = gitlog.filterIgnoreScope(cache, docsReg);

    // --since-date 2020-11-12
    if (option.sinceDate) {
        loginfo('[info] only since date')
    }

    // --ignore-types "build,docs"
    if (option.ignoreTypes) {
        loginfo('[info] filter types with ignore type')
        // cache = cache.filter(v => v.type !== 'docs')

        let ignoretypes = clihooks2array(option.ignoreTypes, objectSelectKeys(option, objectPick(option, 'cliHook')))
        // ignore empty type
        // ignoretypes.push('')
        cache = cache.filter(v => !ignoretypes.some(vn => v.type === vn))
    }
    //  --latest-count 10
    if (option.latestCount && option.latestCount >= 1 && cache.length > 0) {
        loginfo('[info] only the latet count')
        cache = cache.slice(0, option.latestCount)
    }
    // --only-the-latest true
    // if (cache.length > 0) cache = cache[0];

    return cache
}


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
    globy: string
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
    let cache: Commitlog[]

    // --mono-repo true
    if (option.monoRepo) {
        option.globy = `${libdir}/${libname}/*`
    }
    cache = filterData(data, option)
    // log(cache)
    loginfo('[info] cmtedlog count (after filter): ', cache.length)

    loginfo('[info] render new changlog')
    text = mdtableRender(cache, { name, version, repo: option.repo, style: option.style })
    return text.trim()
}



// todo: param to types
function param() {
    let res: any = [
        // ...baseParam(),
        {
            name: '--packages-loc-reg',
            type: 'regexp',
            value: undefined, /// ^packages\//,
            desc: 'the regexp of packages location'
        },
        {
            name: '--out',
            type: 'string',
            value: 'pkgs-cmted.tmp.json',
            desc: 'the file path of output'
        },
        {
            name: '--ignore-types',
            type: 'string',
            value: 'docs,chore,tool,style',
            desc: 'the types to ignore'
        },
        {
            name: '--ignore-subjects',
            type: 'string',
            value: '',
            desc: 'the subjects to ignore'
        },
        {
            name: '--only-pkgs',
            type: 'string',
            value: '',
            desc: 'filter pkgs with the packages loc '
        },
        {
            name: '--log-info',
            type: 'boolean',
            value: false,
            desc: 'set true to log [info] msg'
        },
        {
            name: '--log-task',
            type: 'boolean',
            value: false,
            desc: 'set true to log [task] msg'
        }
    ]
    return res
}
// todo: param to builtin option

export interface ChangelogOption {
    ignoreTypes?: string
    ignoreSubjects?: string,
    onlyPkgs?: string,
    outPkgs?: boolean
    commitlogLoc: string,
    commipkgLoc: string,
    changelogLoc: string,
    logInfo: boolean,
    logTask: boolean,
    monoRepo: boolean,

}


export async function genChangelog(options = {}) {
    const option: ChangelogOption = {
        commitlogLoc: 'commitlog.tmp.json',
        commipkgLoc: 'cmtedpkgs.tmp.json',
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

    log(paramPluginUsage(param()))
    logtask('[task] filter msg for pkg')
    logtask('[task] make changelog with tpl')

    loginfo('[info] read cmted msg ')
    // let cmtedmsgs: Record<string, string | string[]>[]
    let cmtedlogs: Commitlog[]

    // --commitlog-loc  'commitlog.tmp.json'
    loc = option.commitlogLoc
    const changelogio = new ChanelogFileIoStream()
    jsonStreamIo.init(loc)
    cmtedlogs = await jsonStreamIo.read([])

    // sort commitlog with date
    // @ts-ignore
    cmtedlogs = cmtedlogs.sort((a, b) => new Date(b.date) - new Date(a.date))
    // log(cmtedlogs)
    loginfo('[info] cmtedlog count: ', cmtedlogs.length)


    // pass --ignore-types 'chore,tool,docs,style' to ignore this types
    if (option.ignoreTypes) {
        let ignoreTypes = getIgnoreTypes(option.ignoreTypes, 'chore,tool,docs,style') //'chore,tool,docs,style'
        cmtedlogs = cmtedlogs.filter(v => !ignoreTypes.some(it => it === v.type))
    }
    // pass --ignore-subject 'put changelog,dbg markdown list' to ignore this subject
    if (option.ignoreSubjects) {
        let ignoresubjects = getIgnoreTypes(option.ignoreSubjects, 'put changelog,dbg markdown list')
        // ignoresubjects.push('dbg markdown list')
        cmtedlogs = cmtedlogs.filter(v => !ignoresubjects.some(it => it === v.subject))
    }
    // log(cmtedlogs)
    // log(cmtedlogs.length)


    if (!option.monoRepo) {
        let nomonorepotext = render(cmtedlogs, { ...option })
        // log(nomonorepotext)
        loginfo('[info] write changelog for non-mono repo')
        loc = option.changelogLoc
        changelogio.init(loc)
        log(`[info] out: ${loc}`)
        await changelogio.write(nomonorepotext)
        return
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
        const txt: string = render(cmtedlogs, { ...option, wkd: v.loc })
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

function getIgnoreTypes(input: string, builtin: string) {
    let res: string[]
    // let builtin = 'chore,tool,docs,style'
    res = (input ? input : builtin).split(',')
    return res
}

// tsx src/changelog.ts