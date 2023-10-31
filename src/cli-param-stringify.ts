


export type ParamDataJsonLike = Record<string, string>
export interface ParamDataJsonStringifyOption {
    modeStyle: string,
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

        res = Object.keys(json)
            .map(key => {
                // @ts-ignore
                let val = json[key]
                return `${key}=${val}`
            })
            .join('&')
    }
    // param json to swithoption string exp
    if (option.mode === 'string' && option.modeStyle === 'swithoption') {
        res = Object.keys(json)
            .map(key => {
                // @ts-ignore
                let val = json[key]
                return `${key}=${val}`
            })
            .join(';')
    }
    return res
}