
// stage 3
export type FilterFunc = (data: string[], option: any) => string[]
export interface FilterObject {
    name: string,
    main: FilterFunc,
    type?: string
    option?: any
}

export type FilterTree = Record<string, FilterObject>

class CommitpkgFilter {
    filters: FilterTree = {}
    add() {

    }
    run() {

    }
}

// stage 3
const builinFilters = [
    {
        name: 'pick-pkg',
        main: pickPkg
    },
    {
        name: 'omit-pkg',
        main: omitPkg
    },
]

// stage 2
export function pickPkg(data: string[], option: any) {
    return data.filter(location => isOneOfThem(location, option.pickPkg))
}
export function omitPkg(data: string[], option: any) {
    return data.filter(location => !isOneOfThem(location, option.omitPkg))
}


// stage 1
function isOneOfThem(one: string, them: string) {
    if (!them) return false
    let isReg = them.indexOf('*') >= 0
    let input: string[] = them.split(",").map(v => v.trim()).filter(v => v)
    if (isReg) {
        // feat: regard * as .*
        let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
        // console.log(inputReg)
        // list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
        return inputReg.some(reg => reg.test(one))
    }
    return input.includes(them)
}

