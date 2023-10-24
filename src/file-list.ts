import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
// import { join } from 'path'

export interface GetFileListOption {
    wkd:string,
    dir:string,
    macthRules?:RegExp[]
}
export type GetFileListOptionLike = Partial<GetFileListOption>

export interface GetFileListData {
    name:string,
    data:null,
    type?:string
}

export function getFileList(dirs:string,opts?:GetFileListOptionLike){
    let buitinOption:GetFileListOption = {wkd:'',dir:''}
    let option =opts? {...buitinOption,...opts}:buitinOption

    let files :string[]=[]
    // let files = getOutdirfiles(dirs.split('|'))
    // files = wrapFiLeName(files, '{wkd}')
    // files = renderFilename(files, { wkd })
    // files = onlyFileExsits(files)
    // log(files)


    let wkd=option.wkd
    let sep = '/'
    let dirInOption =  option.dir

    let _dirs = (!dirs && dirInOption)?dirInOption : dirs;
    files = _dirs
        .split('|')
        .map(dir => {
            // ./packages/jcm lib -> ./packages/jcm/lib
            let prefix=join(wkd,dir)

            //  ./packages/jcm/lib/xx.js
            if (existsSync(prefix)) {
                return readdirSync(prefix).map(v =>join(wkd,dir,v))
            }
            return ''
        })
        .flat(1)
    
    // ignore empty value
    files = files.filter(v => v)

    // log(files)
    // only file , not dir
    files = files.filter(v => statSync(v).isFile())

    // only matches
    let macthRules = option.macthRules
    if(macthRules){
    // @ts-ignore
        files = files.filter(location => macthRules.some(rule=>rule.test(location)))
    }

    let res:GetFileListData[] = files.map(v => {
        return { name: v, data: null }
    })
    return res

}

// mock path.join
function join(...pathLike:string[]){
    return pathLike.join('/').replace(/\/{2,}/,'/')
}
