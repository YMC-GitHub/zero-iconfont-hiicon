import { padEndString } from './string'

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

/**
 *  get param name - short or long - in name
 * @sample
 * ```
 * // '-n,--name' -> 'name'
 * // '-n' -> 'n'
 * getParamName('-n,--name')
 * ```
 */
export function getParamName(name: string) {
    const [s, l] = name.split(/,/).map(i => i.trim().replace(/^-*/gi, ''))
    // 'hasLong' is assigned a value but never used
    const thelong = s.length > 1 ? s : l
    // thelong = camelize(thelong)
    return thelong
}