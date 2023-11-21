import { readdirSync } from "fs"
import { dirname } from "path"

/**
 * file-list-globy
 * @sample
 * ```
 * globy(`./tmp/setting*`).map(location=>rmSync(location))
 * ```
 */
export function globy(exp: string, data?: string[]) {
    // feat(core): globy them when pass data
    if (data) {
        return data.filter(one => isOneOfThem(one, exp))
    }
    // let exp = `./tmp/setting*`
    let dir: string = ''
    let list: string[] = []

    // ./tmp/setting* -> ./tmp/setting
    dir = dirname(exp.replace(/\*/, ''))

    // get file list in dir or use data from the 2th arg
    list = readdirSync(dir)
    // log(list)

    // ./tmp/setting* ->  setting*
    let filename = exp.replace(/.*\//, '')
    // setting* -> setting.*
    filename = filename.replace(/\*/, '.*')
    // log(filename)


    // setting.* -> /setting.*/
    let reg = new RegExp(filename)
    // log(reg)

    list = list.filter(name => reg.test(name))
    // log(list)

    // ensure not starts with './'
    // './a/' or 'a/' -> 'a/'
    let stdedDir = dir.replace(/^\.\//, '')

    list = list.map(v => `${dir}/${v}`)

    return list
}


/**
 * 
 * @sample
 * ```
 * isOneOfThem('src/xx','*commitlog filter*')
 * ```
 */
function isOneOfThem(one: string, them: string | RegExp[]) {
    // if (!them) return false
    // let isReg = them.indexOf('*') >= 0
    // let input: string[] = them.split(",").map(v => v.trim()).filter(v => v)
    // if (isReg) {
    //     // feat: regard * as .*
    //     let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
    //     // list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
    //     return inputReg.some(reg => reg.test(one))
    // }
    // return input.includes(them)
    let input = Array.isArray(them) ? them : themRegify(them)
    return input.some(reg => reg.test(one))

}
function themArrayify(them: string | string[]) {
    return Array.isArray(them) ? them : them.split(",").map(v => v.trim()).filter(v => v)
}
function themRegify(them: string | string[]) {
    let input = themArrayify(them)
    return input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
}