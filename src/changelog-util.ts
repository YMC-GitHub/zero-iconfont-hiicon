import { basename, dirname } from "./path"
import { camelize, } from "./string"
// import { BaseInfo } from './info'

interface cliOption {
    useEmpty?: boolean
    splitReg: string | RegExp
}

export interface CliHookOption {
    cliHookUseEmpty: boolean
    cliHookSep: string | RegExp
}
export type CliHookOptionLike = Partial<CliHookOption>
const builtinCliHookOption = { cliHookSep: /[,_;| ]/, cliHookUseEmpty: false }

/**
 * 
 * @sample
 * ```
 * // 'a,b,c' -> ['a','b','c']
 * clihooks2array('a,b,c')
 * ```
 */
export function clihooks2array(s: string | string[], options?: CliHookOptionLike) {
    let option: CliHookOption = {
        ...builtinCliHookOption,
        ...(options ? options : {})
    }

    // --cli-hook-sep ','
    let res = Array.isArray(s) ? s : s.split(option.cliHookSep)
    // --cli-hook-use-empty true
    if (!option.cliHookUseEmpty) {
        res = res.filter(v => v)
    }
    return res
}


export interface LocationToConfigOption {
    trim: boolean,
    camelize: boolean
}

export type LocationToConfigOptionLike = Partial<LocationToConfigOption>
const builtinLocationToConfigOption = { trim: true, camelize: false }


/**
 * 
 * get lib name with working dir
 * @sample
 * ```
 * // 'package/noop' -> 'noop'
 * getLibNameFromPath(`package/noop`)
 * ```
 */
export function getLibNameFromPath(wkd: string, options?: LocationToConfigOptionLike) {
    let res = basename(wkd)
    let option: LocationToConfigOption = {
        ...builtinLocationToConfigOption,
        ...(options ? options : {})
    }

    if (option.trim) {
        res = res.trim()
    }
    if (option.camelize) {
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
export function getPackagesLocFromPath(wkd: string) {
    return dirname(wkd)
}


/**
 * get obj only define keys
 * @sample
 * ```
 * // {a:'b',c:'',d:undefined} ->  {a:'b',c:''}
 * getObjOnlyDefinedKeys('')
 * ```
 */
export function getObjOnlyDefinedKeys(option: any = {}) {
    const res: any = {}
    Object.keys(option).forEach(v => {
        if (option[v] !== undefined) {
            res[v] = option[v]
        }
    })
    return res
}

const { log } = console
/**
 * get loginfo function
 */
export function getLogInfo(enable?: boolean) {
    return function (...msg: any) {
        if (enable) {
            log(...msg)
        }
    }
}


type TaskFunc = () => unknown
/**
 * chain async task
 */
export async function chaintask(tasks: TaskFunc[]) {
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

