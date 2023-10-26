import {readdirSync} from "fs"
import {dirname} from "path"

/**
 * file-list-globy
 * @sample
 * ```
 * globy(`./tmp/setting*`).map(location=>rmSync(location))
 * ```
 */
export function globy(exp:string,data?:string[]){
    // let exp = `./tmp/setting*`
    let dir:string =''
    let list:string[]=[]

    // ./tmp/setting* -> ./tmp/setting
    dir=dirname(exp.replace(/\*/,''))

    // get file list in dir or use data from the 2th arg
    list=data?data:readdirSync(dir)
    // log(list)

    // ./tmp/setting* ->  setting*
    let filename = exp.replace(/.*\//,'')
    // setting* -> setting.*
    filename=filename.replace(/\*/,'.*')
    // log(filename)


    // setting.* -> /setting.*/
    let reg = new RegExp(filename)
    // log(reg)

    list=list.filter(name=>reg.test(name))
    // log(list)
    list=list.map(v=>`${dir}/${v}`)
    
    return list
}
