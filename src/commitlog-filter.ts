import type { Commitlog } from './commitlog'
import { objectPick, objectSelectKeys, deepClone } from './object'
import type { CommitlogFilterOption } from "./commitlog-filter-types"

// interface CommitlogFilterOption {
//     version: string,
//     name: string,
//     repo: string,
//     style: string
// }

export function filterCommitlog(data: Commitlog[], option: any) {

    // const loginfo = getLogInfo(option.logInfo)

    // loginfo('[info] grep pkgs commits')
    let cache: Commitlog[] = data.map(v => deepClone(v))

    let pickedCommitlog = pickFileLike(cache, 'file', option.pickFile)
    // --omit-file 'src/*'
    let omitedCommitlog = omitFileLike(cache, 'file', option.omitFile)

    // filter-order:'file-omit,file-pick'
    delCommitlogLikeOmit(cache, omitedCommitlog)
    addCommitlogLikePick(cache, pickedCommitlog)

    // type-omit,type-pick
    delCommitlogLikeOmit(cache, omitFileLike(cache, 'type', option.omitType))
    addCommitlogLikePick(cache, pickFileLike(cache, 'type', option.pickType))

    // scope-omit,scope-pick
    delCommitlogLikeOmit(cache, omitFileLike(cache, 'scope', option.omitScope))
    addCommitlogLikePick(cache, pickFileLike(cache, 'scope', option.pickScope))
    // subject-omit,subject-pick
    delCommitlogLikeOmit(cache, omitFileLike(cache, 'subject', option.omitSubject))
    addCommitlogLikePick(cache, pickFileLike(cache, 'subject', option.pickSubject))

    delCommitlogLikeOmit(cache, omitFileLike(cache, 'file', option.omitFile))
    addCommitlogLikePick(cache, pickFileLike(cache, 'file', option.pickFile))

    delCommitlogLikeOmit(cache, omitFileLike(cache, 'date', option.omitDate))
    addCommitlogLikePick(cache, pickFileLike(cache, 'date', option.pickDate))

    // --globy package/noop/*
    // const reg = new RegExp(`${libdir}/${libname}/`, 'i')
    // cache = data.filter(v => v.file.some(f => reg.test(f)))
    // cache = gitlog.filterInfoByFile(new RegExp(`${libdir}/${libname}/`, 'i'))
    // if (option.globy) {
    //     let reg = new RegExp(option.globy.replace('*', '.*'), 'i')
    //     cache = data.filter(v => v.file.some(f => reg.test(f)))
    // }

    // log('[info] filter since last commit id in changelog.md')
    // cache = gitlog.filterSinceLastChanglog(cache, lastId)
    // filter:ignore docs
    // cache = gitlog.filterIgnoreScope(cache, docsReg);

    //  --latest-count 10
    if (option.latestCount && option.latestCount >= 1 && cache.length > 0) {
        // loginfo('[info] only the latet count')
        cache = cache.slice(0, option.latestCount)
    }
    // --only-the-latest true
    // if (cache.length > 0) cache = cache[0];

    return cache
}

// const { log } = console
// /**
//  * get loginfo function
//  */
// export function getLogInfo(enable?: boolean) {
//     return function (...msg: any) {
//         if (enable) {
//             log(...msg)
//         }
//     }
// }


// export interface CliHookOption {
//     cliHookUseEmpty: boolean
//     cliHookSep: string | RegExp
// }
// export type CliHookOptionLike = Partial<CliHookOption>
// const builtinCliHookOption = { cliHookSep: /[,_;| ]/, cliHookUseEmpty: false }

// /**
//  * 
//  * @sample
//  * ```
//  * // 'a,b,c' -> ['a','b','c']
//  * clihooks2array('a,b,c')
//  * ```
//  */
// export function clihooks2array(s: string | string[], options?: CliHookOptionLike) {
//     let option: CliHookOption = {
//         ...builtinCliHookOption,
//         ...(options ? options : {})
//     }

//     // --cli-hook-sep ','
//     let res = Array.isArray(s) ? s : s.split(option.cliHookSep)
//     // --cli-hook-use-empty true
//     if (!option.cliHookUseEmpty) {
//         res = res.filter(v => v)
//     }
//     return res
// }


function addCommitlogLikePick(cache: Commitlog[], picked: Commitlog[]) {
    picked.forEach(item => {
        const { hash } = item
        let exists = cache.some(inf => inf.hash === hash)
        if (!exists) {
            cache.push(item)
        }
    })
}
function delCommitlogLikeOmit(cache: Commitlog[], omited: Commitlog[]) {
    omited.forEach(item => {
        const { hash } = item
        for (let index = 0; index < cache.length; index++) {
            const inf = cache[index];
            if (inf.hash === hash) {
                cache.splice(index, 1)
            }
        }
    })
}


function omitFileLike(data: Commitlog[], key: string = 'file', omitFile: string = '') {
    let cache: Commitlog[] = []
    if (omitFile) {
        cache = data.filter(item => {
            // const { file } = item
            // @ts-ignore
            let file: string[] = item[key]
            let res: boolean = file.some(v => isOneOfThem(v, omitFile))
            return !res
        })
    }
    return cache
}
function pickFileLike(data: Commitlog[], key: string = 'file', pickFile: string = '') {
    let cache: Commitlog[] = []
    if (pickFile) {
        cache = data.filter(item => {
            // const { file } = item
            // @ts-ignore
            let file: string[] = item[key]
            let res: boolean = file.some(v => isOneOfThem(v, pickFile))
            return res
        })
    }
    return cache
}

function isOneOfThem(one: string, them: string) {
    if (!them) return false
    let isReg = them.indexOf('*') >= 0
    let input: string[] = them.split(",").map(v => v.trim()).filter(v => v)
    if (isReg) {
        // feat: regard * as .*
        let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
        // list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
        return inputReg.some(reg => reg.test(one))
    }
    return input.includes(them)
}