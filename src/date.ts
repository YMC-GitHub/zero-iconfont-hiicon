export type PlainObject = Record<string, any>

/**
 * format date
 * @sample
 * ```
 * let now = new Date();
 * formatDate("yyyy-MM-dd HH:mm:ss",now);
 * ```
 * @description
 * ```
 * M+
 * ```
 */
export function formatDate(fmt: string, ctx?: Date) {
    let res = fmt
    // let ctx = this;
    let context: Date = ctx ? ctx : new Date()
    const o: PlainObject = {
        'M+': context.getMonth() + 1,
        'd+': context.getDate(),
        'H+': context.getHours(),
        'm+': context.getMinutes(),
        's+': context.getSeconds(),
        'S+': context.getMilliseconds()
    }
    let reg: RegExp
    reg = /(y+)/
    if (reg.test(res)) {
        res = res.replace(reg, x => `${context.getFullYear()}`.substring(4 - x.length))
    }
    /* eslint-disable no-restricted-syntax,guard-for-in */
    for (const k in o) {
        reg = new RegExp(`(${k})`)
        if (reg.test(res)) {
            res = res.replace(reg, x => (x.length === 1 ? o[k] : `00${o[k]}`.substring(String(o[k]).length)))
        }
    }
    return res
}