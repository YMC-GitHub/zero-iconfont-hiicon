import { padEndString } from './string'
const { log } = console
export interface CliParam {
    name: string, type: string, value: string | boolean | number, desc: string, optional?: boolean, index?: number
}

export interface ToUsageOption {
    head: string,
    prefixConetnt: string,
    prefixLength: number,
    descPrefixConetnt: string,
    descPrefixLength: number,
    type: boolean
}

// type PrefixOption = Omit<ToUsageOption, 'descPrefixConetnt' | 'descPrefixLength' | 'head'>
// type PrefixOption = Pick<ToUsageOption, 'prefixConetnt' | 'prefixLength'>
// type PrefixOptionLike = Partial<PrefixOption>
// const builtinPrefixOption: PrefixOption = { prefixConetnt: ' ', prefixLength: 2 }

export type ToUsageOptionLike = Partial<ToUsageOption>
export const builtinToUsageOption: ToUsageOption = {
    prefixConetnt: ' ',
    prefixLength: 2,
    descPrefixConetnt: ' ',
    descPrefixLength: 6,
    head: '',
    type: true
}


/**
 * param to usage
 * @sample
 * ```
 * // [{name:'help',type:'boolean',value:false,desc:'info help'}] -> 'help info help (default:false)'
 * param2usage([{name:'help',type:'boolean',value:false,desc:'info help'}])
 * ```
 */
export function param2usage(param: CliParam[], opts?: ToUsageOptionLike) {
    let res: string = ''
    let option: ToUsageOption = { ...builtinToUsageOption, ...(opts ? opts : {}) }
    let { prefixConetnt, prefixLength, descPrefixConetnt, descPrefixLength } = option


    // [{name:'help',type:'boolean',value:false,desc:'info help'}] -> 'help info help (default:false)'
    let arr: string[] = param.map(iten => {
        const { name, value, desc, type } = iten
        // console.log(option.type, type)
        if (option.type) {
            return `${name} ${type} ${desc} (default:'${value}')`
        }
        return `${name} ${desc} (default:'${value}')`
    })

    // beauty usage text
    res = beautyUsage(arr, opts)

    let head = option.head
    if (head) {
        // 'a' -> 'xx\noption:\na'
        res = `${head}\noption:\n${res}`
        res = res.trim()
    }
    return res
}

export function beautyUsage(text: string | string[], opts?: ToUsageOptionLike) {
    let res: string = ''
    let option: ToUsageOption = { ...builtinToUsageOption, ...(opts ? opts : {}) }
    let { prefixConetnt, prefixLength, descPrefixConetnt, descPrefixLength } = option
    let index = (option.type) ? 2 : 1
    let arr = Array.isArray(text) ? text : text.split(/\r?\n/)
    arr = txtUtilAddSpaceByIndex(arr, descPrefixConetnt, descPrefixLength, index)
    res = txtUtilAddSpace(arr, prefixConetnt, prefixLength)
    return res

}

/**
 * format text - add some space as prefix of each line
 * @sample
 * ```
 * // 'help info help (default:false)' -> '  help info help (default:false)'
 * ```
 */
export function txtUtilAddSpace(text: string | string[], space: string = ' ', count: number = 2) {
    const res = Array.isArray(text) ? text : [text]
    return res.join('\n').replace(/^/gim, Array(count).fill(space).join(''))
}

/**
 * beauty text - add some space between name and description
 * @sample
 * ```
 * // 'help info help (default:false)' -> 'help       info help (default:false)'
 * ```
 */
export function txtUtilAddSpaceByIndex(text: string | string[], space: string = ' ', count: number = 6, index = 1) {
    let list = Array.isArray(text) ? text : [text]

    // get the max-str length of name property value
    // const max = Math.max(...list.map(line => line.split(' ')[0].length))
    // get the max-str length of the value front-of-desc
    const max = Math.max(...list.map(line => line.split(' ').slice(0, index).join(' ').length))
    // log(max)

    let plength = max + count
    list = list.map(line => {
        const arr = line.split(' ')
        // let name = arr[0]
        let name = arr.slice(0, index).join(' ')
        const desc = arr.slice(index)
        name = padEndString(name, plength, space)
        return `${name}${desc.join(' ')}`
    })

    return list
    // padding suffix space
}

/**
 * usage to param
 * @psample
 * ```
 * // 'help boolean info help (default:false)' ->  [{name:'help',type:'boolean',value:false,desc:'info help'}]
 * let usage = paramPluginUsage(param(), { type: true })
 * log(usage2param(usage, { type: true }))
 * ```
 */
export function usage2param(usage: string, option: any) {
    let list: string[] = usage.split(/\r?\n/)
    list = list.map(v => v.trim()).filter(v => /^ *-/i.test(v))

    return list.map(item => {
        let name = item.replace(/ +.*$/, '')

        // let match = item.match(/\(default:.*\)/)
        // let value = match ? match[0] : ''
        let [matchValue, value] = u2pGetDefaultValue(item, 'default')

        let desc = item.replace(name, '').replace(matchValue, '').trim()
        let type = option.type ? desc.replace(/ +.*$/, '') : ''
        if (type) {
            desc = desc.replace(type, '').trim()
        }
        // value = value.replace(/\(|\)/ig, '').replace(/default:/ig, '').replace(/(^')|('$)/ig, '')
        let passedValue = u2pParseValue(value, type)

        let [matchIndex, index] = u2pGetDefaultValue(item, 'index')
        // if (!index) index = '-1'
        if (index) return { name, type, value: passedValue, desc, index }

        return { name, type, value: passedValue, desc }
    })

}

function u2pGetDefaultValue(input: string, key?: string) {
    // help boolean info help (default:false) -> (default:'false')
    let reg = key ? new RegExp(`\\(${key}:.*\\)`) : /\(default:.*\)/
    // console.log(reg)
    let match = input.match(reg)
    let matchValue = match ? match[0] : ''

    // (default:'false') -> false
    reg = key ? new RegExp(`${key}:`, 'ig') : /default:/ig
    let value = matchValue.replace(/\(|\)/ig, '').replace(reg, '').replace(/(^')|('$)/ig, '')
    return [matchValue, value]
}

function u2pParseValue(value: string, type: string) {
    let passedValue: any = value
    if (type === 'boolean') {
        // if (oneOfThem(value, 'true,false')) {
        //     passedValue = Boolean(value)
        // }
        if (isOneOfThem(value, 'true,0')) {
            passedValue = true
        }
        if (isOneOfThem(value, 'false,1')) {
            passedValue = false
        }
    }
    if (type === 'number') {
        if (/\d+/.test(String(value))) passedValue = Number(value)
    }
    if (type === 'regexp') {
        passedValue = value.replace(/\*/, '.*')
        if (passedValue === '') passedValue = '.*'
        passedValue = new RegExp(passedValue)
    }
    return passedValue
}


/**
 * flags to usage
 * @sample
 * ```
 * // {help:true} -> 'help boolean to-write-desc-here (default:false)'
 * flags2usage({help:true},{type:true})
 * ```
 */
export function flags2usage(flags: any, option: any) {
    let list: string[] = Object.keys(flags)
    return list.map(name => {
        let value = flags[name]
        let type = typeof value
        let desc = 'to-write-desc-here'
        if (option.type) {
            return `${name} ${type} ${desc} (default:'${value}')`
        }
        return `${name} ${desc} (default:'${value}')`
    }).join('\n')

}

/**
 * flags to param
 */
export function flags2param(flags: any) {
    let list: string[] = Object.keys(flags)
    return list.map(name => {
        let value = flags[name]
        let type = typeof value
        let desc = 'to-write-desc-hear'
        return { name, type, value, desc }
    }).join('\n')
}

/**
 * param to flags
 */
export function param2flags(param: CliParam[], option: any) {
    let res: any = {}
    // let option: ToUsageOption = { ...builtinToUsageOption, ...(opts ? opts : {}) }
    param.forEach(iten => {
        const { name, value, type } = iten
        // return { [`${name}`]: value }
        let passedValue: any = value
        res[name] = passedValue
    })
    // res = Object.assign({}, ...arr)
    return res
}



// workflow 1: define-usage,usage2param,param2flags,param2usage,param2types
// workflow 2: define-param,param2flags,param2usage,param2types

// name,index,type,value
// 

/**
 * 
 * @sample
 * ```
 * pick(usage(),'*commitlog filter*')
 * ```
 */
export function pickUsage(text: string, rule: string) {
    // log(`[info] usage filter`, rule)

    return text.split(/\r?\n/).filter(line => isOneOfThem(line, rule)).join('\n')


}

/**
 * 
 * @sample
 * ```
 * isOneOfThem('src/xx','*commitlog filter*')
 * ```
 */
function isOneOfThem(one: string, them: string) {
    // feat(core): regard them as regexp when including *
    // feat(core): split them with ,
    // feat(core): ignore empty space in them

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