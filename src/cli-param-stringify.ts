


export type ParamDataJsonLike = Record<string, string>
export interface ParamDataJsonStringifyOption {
    modeStyle: 'cli' | 'httpquery' | 'swithoption',
    mode: string
}
export const builtinParamDataJsonStringifyOption = {
    modeStyle: 'cli',
    mode: 'string'
}

export function paramJsonToString(json: ParamDataJsonLike[], options?: any) {
    const option: ParamDataJsonStringifyOption = {
        ...builtinParamDataJsonStringifyOption,
        ...(options ? options : {})
    }
    let res = ''
    // param json to cli string exp
    // {a:'b',c:'d',wd:'d'}  -> '-a=b -c=d --wd=d'
    if (option.mode === 'string' && option.modeStyle === 'cli') {
        res = Object.keys(json)
            .map(key => {
                // @ts-ignore
                let val = json[key]
                if (key.length > 1) {
                    return `--${key}=${val}`
                }
                return `-${key}=${val}`
            })
            .join(' ')
    }

    // param json to httpquery string exp
    if (option.mode === 'string' && option.modeStyle === 'httpquery') {
        res = kvsify(json, '=&')
    }
    // param json to swithoption string exp
    if (option.mode === 'string' && option.modeStyle === 'swithoption') {
        res = kvsify(json, '=;')
    }
    return res
}

/**
 * kvs - key value string
 * @sample
 * ```
 * // {a:'b',c:1} => 'a=b;c=1'
 * kvsify({a:'b',c:1},'=;') 
 * 
 * // {a:'b',c:1} => 'a=b&c=1'
 * kvsify({a:'b',c:1},'=&') 
 * 
 * // {a:'b',c:1} => 'a:b,c:1'
 * kvsify({a:'b',c:1},':,') 
 * 
 * // {a:'b',c:1} => 'a=b c=1'
 * kvsify({a:'b',c:1},'= ') 
 * ```
 */
export function kvsify(json: any, sep = '=;') {
    let [kv, kvp] = sep.trim().split('')
    let res: string = Object.keys(json)
        .map(key => {
            let val = json[key]
            return `${key}${kv}${val}`
        })
        .join(kvp)
    return res
}