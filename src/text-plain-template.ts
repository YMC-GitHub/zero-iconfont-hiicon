
// export type PlainObject = Record<string, string>
export type PlainObject = Record<string, any>
/**
 * 
 * @sample
 * ```
 * // 'hello {name}!' -> 'hello zero!'
 * renderTpl('hello {name}!',{name:'zero'})
 * ```
 */
export function renderTpl(tpl: string, data: PlainObject) {
    let res = tpl
    Object.keys(data).forEach(key => {
        const value = data[key]
        res = res.replace(new RegExp(`{${key}}`, 'ig'), value)
    })
    return res
}


/**
 *
 * ```
 * writeTpl('{method} repo/owner',{method:'POST'}) //POST repo/owner
 * ```
 */
export function writeTpl(tpl: string, data?: PlainObject) {
    if (data) {
        return renderTpl(tpl, data)
    }
    return (v: PlainObject) => renderTpl(tpl, v)
}


// class PlainTpl {
//     data: Record<string, string> | undefined = {}

//     render(tpl: string, data: Record<string, string>) {
//         let res = tpl
//         if (data) {
//             Object.keys(data).forEach(key => {
//                 // @ts-ignore
//                 const value = data[key]
//                 res = res.replace(new RegExp(`{${key}}`, 'ig'), value)
//             })
//         }
//         return res
//     }
//     write(tpl: string) {
//         let res = tpl
//         let { data } = this
//         if (data) {
//             return this.render(tpl, data)
//         }
//         return res
//     }
// }