import { execWraper as exec, execOpts } from './exec'
const { log } = console
import { rungit as runcmd } from './commitlog'
import { JsonStreamIo } from './jsonstreamio'
import { baseParam } from './cli-param-preset'
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

export async function getCmtPkgs(options = {}) {
    const option = {
        file: 'pkgs-cmted.tmp.json',
        packagesLoc: '',
        packageslocReg: /^packages\//,
        logInfo: false,
        logTask: false,
        ...options
    }
    if (option.packagesLoc) {
        option.packageslocReg = option.packagesLoc.split(",").map(v => v.trim()).filter(v => v).map(v => new RegExp(`^${v}`))[0]
    }
    const { packageslocReg } = option


    const loginfo = getLogInfo(option.logInfo)
    const logtask = getLogInfo(option.logTask)

    logtask('[task] read commited pkgs from gitlog')
    loginfo('[info] read commited pkgs')
    let pkgcmt
    pkgcmt = await runcmd('git ls-tree --full-tree --name-only -r HEAD', execOpts)
    pkgcmt = pkgcmt.split(/\r?\n/).filter(v => v)
    pkgcmt = await getCmtedVcPkgNameInLoc({ files: pkgcmt, for: 'pkg-loc', packageslocReg })
    log(pkgcmt.join('\n'))

    loginfo('[info] save commited pkgs')
    const loc = option.file
    const jsonstream = new JsonStreamIo()
    jsonstream.init(loc)
    await jsonstream.write(pkgcmt)
    loginfo(`[info] out: ${loc}`)
    return pkgcmt
}


interface GetCmtedVcPkgNameInLocationOptions {
    files: string[],
    EOFReg: RegExp,
    pathSplit: string,
    packageslocReg: RegExp,
    for: string
}
/**
 * get pkg name of version control (vc) - mono repo,cmted
 */
async function getCmtedVcPkgNameInLoc(options = {}) {
    const option: GetCmtedVcPkgNameInLocationOptions = {
        EOFReg: /\r?\n/,
        pathSplit: '/',
        packageslocReg: /^packages\//,
        files: [],
        for: 'pkg-name',
        ...options
    }

    let { files } = option
    if (!files) return []
    // only in package loc
    files = files.filter(v => option.packageslocReg.test(v))

    const sep = option.pathSplit
    // get name or loc
    // eg. file=packages/noop/xx ; name=noop;loc=packages/noop;
    switch (option.for.toLowerCase()) {
        case 'pkg-loc':
            files = files.map(v => v.split(sep).slice(0, 2).join(sep)).filter(v => v)
            break
        case 'pkg-name':
        default:
            files = files.map(v => v.split(sep)[1]).filter(v => v)
            break
    }

    // del dup
    files = [...new Set(files)]
    return files
}