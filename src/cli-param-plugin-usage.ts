import { padEndString } from './string'

export interface CliParam {
    name: string, type: string, value: string | boolean | number, desc: string
}

export interface ToUsageOption {
    head: string,
    prefixConetnt: string,
    prefixLength: number,
    descPrefixConetnt: string,
    descPrefixLength: number,
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
    head: ''
}


/**
 *
 * @param {{name:string,type:string,desc:string,value:string}[]} param
 * @param {string} head
 * @return {string}
 * @sample
 * ```
 * // [{name:'help',type:'boolean',value:false,desc:'info help'}] -> 'help info help (default:false)'
 * paramPluginUsage([{name:'help',type:'boolean',value:false,desc:'info help'}])
 * ```
 */
export function paramPluginUsage(param: CliParam[], opts?: ToUsageOptionLike) {
    let res: string = ''
    let option: ToUsageOption = { ...builtinToUsageOption, ...(opts ? opts : {}) }
    // [{name:'help',type:'boolean',value:false,desc:'info help'}] -> 'help info help (default:false)'
    res = param.map(iten => {
        const { name, value, desc } = iten
        return `${name} ${desc} (default:${value})`
    }).join('\n')

    let head = option.head
    if (head) {
        // 'a' -> 'xx\noption:\na'
        res = `${head}\noption:\n${res}`
        res = res.trim()
    }

    let { prefixConetnt, prefixLength, descPrefixConetnt, descPrefixLength } = option

    res = formatText(beautyText(res, descPrefixConetnt, descPrefixLength), prefixConetnt, prefixLength)
    return res
}

/**
 * format text - add some space as prefix of each line
 * @sample
 * ```
 * // 'help info help (default:false)' -> '  help info help (default:false)'
 * ```
 */
export function formatText(text: string | string[], prefix: string = ' ', count: number = 2) {
    const res = Array.isArray(text) ? text : [text]
    return res.join('\n').replace(/^/gim, Array(count).fill(prefix).join(''))
}

/**
 * beauty text - add some space between name and description
 * @sample
 * ```
 * // 'help info help (default:false)' -> 'help       info help (default:false)'
 * ```
 */
export function beautyText(text: string | string[], space: string = ' ', count: number = 6) {
    let list = Array.isArray(text) ? text : [text]

    // get the max-str length of name property value
    const max = Math.max(...list.map(line => line.split(' ')[0].length))
    list = list.map(line => {
        const arr = line.split(' ')
        let name = arr[0]
        const desc = arr.slice(1)
        name = padEndString(name, max + count, space)
        return `${name}${desc.join(' ')}`
    })
    // log(max)
    return list
    // padding suffix space
}

// export { formatText, beautyText, pluginUsage }
