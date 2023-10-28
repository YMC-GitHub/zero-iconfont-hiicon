import {readdirSync,rmSync,renameSync,copyFileSync,mkdirSync,existsSync,rmdirSync, statSync} from "fs"
import {dirname,resolve} from "path"

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


    // ensure not starts with './'
    // './a/' or 'a/' -> 'a/'
    let stdedDir = dir.replace(/^\.\//,'')

    list=list.map(v=>`${stdedDir}/${v}`)
    
    return list
}

/**
 * 
 * @sample
 * ```
 * rm(`./tmp/setting*`)
 * ```
 */
export function rm(dir:string){
    let list = globy(dir)
    // console.log(`[info] remove `,list)
    list.forEach(location=>{
        rmSync(location,{recursive:true,force:true})
        // let stat = statSync(location)
        // if(stat.isFile()){
            // rmSync(location,{recursive:true,force:true})
        // }
    })
}

/**
 * 
 * @sample
 * ```
 * cp(`./src/exec*.ts`,'./package/exec/')
 * ```
 */
export function cp(dir:string,desDir:string='./'){
    // ensure not ends with '/'
    let des = desDir.replace(/\/*$/,'')
    globy(dir).forEach(location=>{
        let desloc = `${des}/${location}`
        makedirs(desloc)
        // not overide
        if(!existsSync(desloc)){
            copyFileSync(location,desloc)
        }
        
    })
}


// function stdPath(pathLike:string){
//     let stdedDir = pathLike.replace(/^\.\//,'')
//     stdedDir = stdedDir.replace(/\/*$/,'')
//     return stdedDir
// }

export function makedirs(loc:string){
    let dir = dirname(resolve(loc))
    if(!existsSync(dir)) mkdirSync(dir,{recursive:true})
}

/**
 * 
 * @sample
 * ```
 * mv(`./outpkgs/src/exec.ts`,'./outpkgs/src/index.ts')
 * ```
 */

export function mv(src:string,des:string){
    // renameSync
    // let list = globy(dir)
    // let src = list[0]
    if(!existsSync(des) && existsSync(src)){
        renameSync(src,des)
    }
}


// const {log}= console
// let list:string[]=[]
// // list= globy(`./src/*.ts`)
// list= globy(`./src/exec*.ts`)
// log(`[globy] list: `,list)

// // todo: detect -r, -f -rf, -fr
// // -fr -> {recurse:true,force:true}

// log(`[copy] list: `,list)
// cp(`./src/exec*.ts`,`./outpkgs/`)

// let [src,des] = [`./outpkgs/src/exec.ts`,'./outpkgs/src/index.ts']
// log(`[mv] file: `,[src,des].join(" -> "))
// mv(src,des)

// tsx src/rm.ts