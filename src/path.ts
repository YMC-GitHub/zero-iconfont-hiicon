/* eslint-disable prefer-const,no-use-before-define */
// https://nodejs.org/api/path.html

// const path = {}
// path.sep = '/'
// let defSep = '/'

/**
 * mock node.js path.dirname
 */
function dirname(wkd: string) {
    // @ts-ignore
    const sep: string = dirname.sep ? dirname.sep : '/'
    const list = wkd.split(/\/?\\|\//)
    // if ((list.length = 1)) return list.join(sep)
    return list.slice(0, list.length - 1).join(sep)
}

/**
 * mock node.js path.basename
 */
function basename(wkd: string, suffix?: string) {
    const list = wkd.split(/\/?\\|\//)
    const res = list[list.length - 1]
    if (!suffix) return res
    return res.replace(new RegExp(`${suffix}$`), '')
}

/**
 * mock node.js path.extname
 */
function extname(wkd: string) {
    const reg = /(.*)?\./gi
    if (!reg.test(wkd)) return ''
    const res = wkd.trim().replace(/(.*)?\./gi, '')
    return res ? `.${res}` : ''
}

/**
 * mock node.js path.join (expect join.sep ='/')
 */
function join(...pathLike: string[]) {
    // @ts-ignore
    const sep: string = join.sep ? join.sep : '/'
    const list = [...pathLike]
        .map(v => v.split(/\/?\\|\//))
        .flat(Infinity)
        .filter(v => v)
    return list.join(sep)
}

interface PathJson {
    root?: string,
    dir?: string,
    base?: string,
    name: string,
    ext?: string
}

/**
 * mock node.js path.format
 */
function format(obj: PathJson) {
    let res: string = ''
    let { root, dir, base, name, ext } = obj
    // @ts-ignore
    const sep = format.sep ? format.sep : '/'
    // add dot when ext
    // if (ext) {
    //     let ext = ext.trim()
    //     if (ext.indexOf('.') !== 0) {
    //         ext = `.${ext}`
    //     }
    // }
    if (ext) ext = ext.replace(/^ ?\.? ?/, '.')

    if (!base) {
        base = `${name}${ext}`
    }
    if (dir) {
        res = `${dir}${sep}${base}`
        return res
    }
    if (root) {
        res = `${root}${base}`
        return res
    }
    return base
}

/**
 * mock node.js path.isAbsolute
 */
function isAbsolute(wkd: string) {
    const reg = /^\/|(\\\\)|([A-Z]:)|([a-z]:)/
    /// ^\/|(\\\\)|([A-Z]:)|([a-z]:)/
    if (!wkd) return false
    return reg.test(wkd)
}

/**
 * mock node.js path.parse
 */
function parse(wkd: string) {
    let root
    let dir
    let base
    let name
    let ext
    base = basename(wkd)
    ext = extname(base)
    name = ext ? basename(wkd, ext) : base
    root = getRoot(wkd)
    dir = wkd.replace(new RegExp(`${base}$`, 'i'), '')
    // not ends with / for unix when dir.length !==1
    if (dir.length !== 1) dir = dir.replace(/\/$/, '')

    return {
        root,
        dir,
        base,
        name,
        ext
    }
    /**
     *
     * @param {string} dirs
     * @returns {string}
     */
    function getRoot(dirs: string) {
        if (!isAbsolute(dirs)) return ''
        let res = ''
        // res = dir.replace(/(\/?\/)|\\.*/gi, '')
        let arr = dirs.split(/(\/?\/)|\\/)
            ;[res] = arr
        // win
        if (res) {
            let tmp = `${res}/`
            if (dirs.indexOf(tmp) === 0) return tmp
            return `${res}\\`
        }
        // unix
        return '/'
        // if (!res) return '/'
    }
}

// todo:()
// normalize,reslove,relative
export { dirname, basename, extname, format, isAbsolute, join, parse }
