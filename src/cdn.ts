import { readFileSync, writeFileSync, readdirSync, existsSync, statSync,mkdirSync } from 'fs'

const {log}=console

export interface CssToCdnOption {
    cdn:string,
    filename:string,
    text:string
}
export type CssToCdnOptionLike = Partial<CssToCdnOption>

// filename -> `{cdn}{filename}`
export function toFontCssCdn(opts?:CssToCdnOptionLike){

    let buitinOption:CssToCdnOption = {cdn:'',filename:'iconfont',text:''}
    let option =opts? {...buitinOption,...opts}:buitinOption

    // let text =loadTextFile(`fonts/iconfont.css`)
    let {text,cdn,filename}=option

    cdn=cdn?cdn:filename
    // .. -> .
    cdn=`${cdn}.`.replace(/\.+$/,'.')

    // cdn='//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.'

    let reg = new RegExp(`${filename}\\.`,'ig')
    // log(reg)
    text = text.replace(reg,cdn)

    return text
    
}

export function loadTextFile(loc:string,defaultText=''){
    let text = ''
    try {
        text = readFileSync(loc).toString()
    } catch (error) {
        text = defaultText
    }
    return text
}

export interface GetJsdeliverUrlOprion {
    cdnSiteUrl:string,
}
export type GetJsdeliverUrlOprionLike = Partial<GetJsdeliverUrlOprion>


// githubOption -> url
export function getCdnJsdelivrUrl(data:string[],cdnSiteUrl='//cdn.jsdelivr.net'){
    let [user,repo,tag,file,site] = data
    let url:string=''
    switch (site) {
        case 'gh':
            url= `${cdnSiteUrl}/gh/${user}/${repo}@${tag}/${file}`
            break;
        case 'npm':
        default:
            url= `${cdnSiteUrl}/npm/${repo}@${tag}/${file}`
            break;
    }
    return url
}

// url -> option
export function parseGithubUrl(s:string){
    let res:string[]=[]
    let array = s.split('/')

    // find github.com index
    let index =array.indexOf('github.com')
    // log(array,index)

    if(index>=0){
        let user = array[index+1]
        let repo = array[index+2]

        let path = array.slice(index+3)
        // del blob prefix in file
        if(path[0]==='blob'){
            path.shift()
        }
        // get tag
        let tag=path[0]
        let file = path.slice(1).join('/')

        // log([user,repo,tag,file,'gh'])
        res = [user,repo,tag,file,'gh']
    }
    return res
}


// todo: github url -> jsdeliver url
export function githubUrl2jsdeliverUrl(s:string,cdnSiteUrl='//cdn.jsdelivr.net'){
    let url:string=''
    // https://github.com/YMC-GitHub/zero-iconfont-hiicon/blob/main/fonts/iconfont.css -> 
    let data = parseGithubUrl(s)
    url = getCdnJsdelivrUrl(data,cdnSiteUrl)
    url = url.toLowerCase();
    return url
}

// todo:
// cdn.staticaly.com/gh/:user/:repo/:tag/:file
// cdn.staticaly.com/gl/:user/:repo/:tag/:file