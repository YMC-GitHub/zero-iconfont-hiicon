export type PlainObject = Record<string, any>
const { log } = console
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

/**
 * 
 * @sample
 * ```
 * let {log}=console
 * let date = new Date()
 * log(date)
 * changeDate('1s', date)
 * log(date)
 * ```
 *  
 */
export function changeDate(fmt: string, ctx?: Date) {
    // let ctx = this;
    let context: Date = ctx ? ctx : new Date()
    // const o: PlainObject = {
    //     's': (n: number) => n * 1000,
    //     'm': (n: number) => n * 60 * 1000,
    //     'h': (n: number) => n * 60 * 60 * 1000,
    //     'd': (n: number) => n * 24 * 60 * 60 * 1000,
    //     'w': (n: number) => n * 7 * 24 * 60 * 60 * 1000,
    //     'M': (n: number) => (context.getMonth() + n),
    //     'y': (n: number) => (context.getFullYear() + n),

    // }
    // '  ' -> ''
    let stdfmt = fmt.replace(/ ?/g, '')
    const o: PlainObject = {
        's': (n: number) => context.setSeconds((context.getSeconds() + n)),
        'm': (n: number) => context.setMinutes((context.getMinutes() + n)),
        'h': (n: number) => context.setHours((context.getHours() + n)),
        'd': (n: number) => context.setDate((context.getDate() + n)),
        'w': (n: number) => context.setDate((context.getDate() + n * 7)),
        'M': (n: number) => context.setMonth((context.getMonth() + n)),
        'y': (n: number) => context.setFullYear((context.getFullYear() + n)),

    }
    let reg: RegExp
    for (const k in o) {
        reg = new RegExp(`-?\\d+${k}`)
        let match = stdfmt.match(reg)
        if (match) {
            // log(reg)
            let input: string = match[0]
            let [n, unit] = getNunit(input)
            // log(n, unit)
            o[k](Number(n))
        }
    }
    return context

    function getNunit(input: string) {
        let res: string[] = []
        let reg = /-?\d+/
        let match = input.match(reg)
        let num: string = match ? match[0] : ''

        let unit: string = num ? input.replace(num, '') : ''
        res = [num, unit]
        return res
    }
}
/**
 * 
 * @sample
 * ```
 * let date = createDate('2023-11-19 17:00:38')
 * formatDate("yyyy-MM-dd HH:mm:ss", date);
 * ```
 */
export function createDate(date: string | number | Date = '') {
    return date ? new Date(date) : new Date()
}



// 'en-US','Asia/Shanghai'
export function getDateOfShanghai(timeZone: string = 'Asia/Shanghai') {
    const nDate = new Date().toLocaleString('en-US', {
        timeZone
    });
    // console.log(nDate);
    return new Date(nDate)
}


// let now = getDateOfShanghai()
// let datestr = formatDate("yyyy-MM-dd HH:mm:ss", now);

// log(datestr)
// let date = createDate('2023-11-19 17:00:38')
// // log(date)
// datestr = formatDate("yyyy-MM-dd HH:mm:ss", date);
// log(datestr)
// changeDate('-61s', date)
// datestr = formatDate("yyyy-MM-dd HH:mm:ss", date);
// // log(date)
// log(datestr)

// getDateByTz()

// /**
//  *
//  * @sample
//  * ```
//  * let input:string;let output:string[]
//  * input='1d';output=[ '1', 'd' ]
//  * nunitArrayify(input)//[ '1', 'd' ]
//  *
//  * input='-1d';output=[ '-1', 'd' ]
//  * input='- 1 d';output=[ '-1', 'd' ]
//  * ```
//  */
// function nunitArrayify(s: string) {
//     // -feat(core): muti-space to one
//     // feat(core): muti-space to zero
//     // feat(core): '1d' to ['1','d']
//     let input: string = s
//     // '  ' -> ' '
//     // input = input.replace(/ +/g, ' ')
//     // '  ' -> ''
//     input = input.replace(/ ?/g, '')
//     // console.log(input)

//     let validInputReg = /-?\d+[a-zA-Z_-]/g
//     throwErrorWhen(`[warn] please pass valid input nunit`, !validInputReg.test(input))
//     let res: string[] = []
//     let reg = /-?\d+/
//     let match = input.match(reg)
//     let num: string = match ? match[0] : ''

//     let unit: string = num ? input.replace(num, '') : ''
//     res = [num, unit]
//     return res
// }

// /**
//  *
//  * @sample
//  * ```
//  * throwErrorWhen(`[warn] please pass valid input nunit`,true)
//  * ```
//  */
// function throwErrorWhen(desc: string, when: boolean) {
//     if (when) {
//         // define err and throw err
//         let err = new Error(desc)
//         throw (err)
//     }
// }
// tsx src/date.ts