import { camelize } from './string'

export interface CliParam {
    name: string, type: string, value: string | boolean | number, desc: string, optional?: string
}

type PlainDataJson = Record<string, string | boolean | number>

// export interface ToUsageOption {
//     head: string,
//     prefixConetnt: string,
//     prefixLength: number,
//     descPrefixConetnt: string,
//     descPrefixLength: number,
// }

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


/**
 * gen table th align by keys
 * @sample
 * ```
 * // ':----' -> ':----|:----'
 * getAlignByKeys(':----',['a','b'])
 * ```
 */
export function getAlignByKeys(align: string, keys: string[]) {
    return keys.map(() => align).join('|')
}

/**
 * gen table body by keys
 * @sample
 * ```
 * // [{a:'b',c:'d',e:'f'}] -> 'b|d'
 * getBodyByKeys([{a:'b',c:'d'}],['a','b'])
 * ```
 */
export function getBodyByKeys(data: PlainDataJson[], keys: string[]) {
    return data.map(v => keys.map(k => v[k]).join('|')).join('\n')
}


export interface MdTableDataJson {
    title: string, head: string, thAlign: string, body: string
}
/**
 * get table
 * @sample
 * ```
 * //  { title, head, thAlign, body } -> '{title}\n{head}\n{thAlign}\n{body}\n\n'
 * ```
 */
export function getTable(data: MdTableDataJson) {
    const { title, head, thAlign, body } = data
    let res
    res = `${title}\n${head}\n${thAlign}\n${body}`
    res = res.trim()
    res = `${res}\n\n`
    return res
}


/**
 * param json to markdown table
 * @param {{name:string,type:string,desc:string,value:string}[]} param
 * @param {string} title
 * @param {{keys:string,align:string,slimName:boolean,camelizeName:boolean}} options
 * @return {string}
 * @sample
 * ```
 * mdtable([{name:'help',type:'boolean',value:false,desc:'info help'}])
 * ```
 */
export function mdtable(param: CliParam[], title = '## param', options = {}) {
    let res: string = ''
    const option = {
        keys: 'name,type,value,desc,optional',
        align: ':--',
        slimName: true,
        camelizeName: true,
        ...options
    }

    let resJson = param.map(item => {
        let { name, type, value, desc, optional } = item
        let mname = option.slimName ? getParamName(name) : name
        mname = option.camelizeName ? camelize(mname) : mname
        if (!optional) {
            optional = ''
        }
        return {
            name: mname,
            type,
            value,
            desc,
            optional
        }
    })

    let keys
    let head
    let thAlign
    let body
    keys = option.keys.split(',').map(v => v.trim())
    // get head by keys
    head = keys.join('|')
    // get th-align by keys
    thAlign = getAlignByKeys(option.align, keys)
    // get body by keys
    body = getBodyByKeys(resJson, keys)
    res = getTable({
        title,
        head,
        thAlign,
        body
    })
    return res
}

export function noop() { }