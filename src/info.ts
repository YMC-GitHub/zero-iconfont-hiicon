import { formatDate } from './date'

export class BaseInfo {
    cache: string[] = []
    action: string = ''
    disableAll: boolean = false
    constructor() {

    }
    record(text: string, tpl = '[info] [time] text') {
        if (this.disableAll) return this
        let time = formatDate("yyyy-MM-dd HH:mm:ss")
        // .replace(/prefix/,prefix.replace(/:*$/,':'))
        let note = tpl.replace(/text/, text).replace(/time/, time)
        this.cache.push(note)
        if (this.isAction('print-in-record')) {
            console.log(note)
        }
        // this.cache.push(recordInfo(text,tpl))
        return this
    }
    print(text: string, tpl = '[info] [time] text') {
        if (this.disableAll) return this
        this.record(text, tpl)
        if (!this.isAction('print-in-record')) {
            console.log(this.cache[this.cache.length - 1])
        }
        return this
    }
    printAll() {
        if (this.disableAll) return this
        console.log(this.toString())
        return this
    }
    toString() {
        return this.cache.join('\n')
    }
    isAction(action: string) {
        return (this.action.toLowerCase() === action.toLowerCase())
    }
    enablePrintInRecord() {
        this.action = 'print-in-record'
        return this
    }

    new() {
        return new BaseInfo()
    }
}


// export function recordInfo(text:string,tpl='[info] [time] text'){
//     let time = formatDate("yyyy-MM-dd HH:mm:ss")
//     // .replace(/prefix/,prefix.replace(/:*$/,':'))
//     let note = tpl.replace(/text/,text).replace(/time/,time)
//     // console.log(note)
//     return note
// }
