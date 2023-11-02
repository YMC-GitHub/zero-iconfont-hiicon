import { camelize } from './string'
import { getParamName, formatText } from './cli-util'

export interface CliParam {
    name: string, type: string, value: string | boolean | number, desc: string, optional?: boolean
}


export interface paramPluginTsdocOption {
    // head: string,
    indentSize: number,
    optional: string,
    requires: string,
    omit: string,
    pick: string,

}

/**
 * param json to ts interface
 * @param {{name:string,type:string,desc:string,value:string}[]} param
 * @param {string} head
 * @param {{indentSize:number}} options
 * @return {string}
 * @sample
 * ```
 * main([{name:'help',type:'boolean',value:false,desc:'info help'}])
 * ```
 */
export function paramPluginTsdoc(param: CliParam[], head = 'baseOptions', options: any = {}) {
    let res: string = ''
    const option = {
        indentSize: 2,
        ...options
    }

    // filter-param:ignore-omit,get-pick,include-pick
    let flitedParam: CliParam[] = []
    if (option.omit) {
        flitedParam = param.filter(item => {
            const { name, type } = item
            const mname = camelize(getParamName(name))
            return !isOneOfThem(mname, option.omit)
        })
    }

    let pickParam: CliParam[] = []
    if (option.pick) {
        pickParam = param.filter(item => {
            const { name, type } = item
            const mname = camelize(getParamName(name))
            return isOneOfThem(mname, option.pick)
        })
    }

    pickParam.forEach(item => {
        const { name, type } = item
        let exists = flitedParam.some(inf => inf.name === name)
        if (!exists) {
            flitedParam.push(item)
        }
    })


    // interfaceify:requires,optional,other
    let arr: string[] = flitedParam.map(item => {
        const { name, type } = item
        const mname = camelize(getParamName(name))
        if (isOneOfThem(mname, option.requires)) {
            return `${mname}:${type};`
        }

        if (item.optional || isOneOfThem(mname, option.optional)) {
            return `${mname}?:${type};`
        }
        return `${mname}:${type};`
    })
    res = arr.join('\n')
    res = formatText(res, ' ', option.indentSize)
    res = `interface ${head} {\n${res}\n}`
    return res
}

function isOneOfThem(one: string, them: string) {
    if (!them) return false
    let isReg = them.indexOf('*') >= 0
    let input: string[] = them.split(",").map(v => v.trim()).filter(v => v)
    if (isReg) {
        let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
        // list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
        return inputReg.some(reg => reg.test(one))
    }
    return input.includes(them)
}