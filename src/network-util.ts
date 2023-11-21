
// topic: factorial,number-enhance,
import { facWithForLoop as fac } from "./number-fac"


// yours touch src/network-mask.ts
// yours touch src/network-prefix.ts

export function PreferValueAsNumber(value: number | string) {
    return typeof value === 'string' ? Number(value) : value
}

export function PreferValueAsString(value: string | number) {
    return typeof value === 'number' ? String(value) : value
}

export function CodeMask(index: number | string, value: string | number, startIndex: number = 0) {
    let inputIndex = PreferValueAsNumber(index)
    let inputValue = PreferValueAsString(value)
    let res: string = ''
    switch (inputIndex - startIndex) {
        case 0:
            res = `value.0.0.0`
            break;
        case 1:
            res = `1.value.0.0`
            break;
        case 2:
            res = `1.1.value.0`
            break;
        case 3:
        default:
            res = `1.1.1.value`
            break;
    }
    res = res.replace(/1/g, '255').replace(/value/g, inputValue)
    return res
}

export function ParseMask(mask: string, startIndex: number | string = 0) {
    let inputStartIndex = PreferValueAsNumber(startIndex)


    let stdmask: string = mask.replace(/ ?/g, '')
    let list = stdmask.split('.')
    let index: number = 3
    let match = list.indexOf('0')
    // index = match >=0 ? match : 3
    // feat(core): started with index 1
    // index = index + startIndex
    // let  value = list[index]
    let value: string = ''
    if (match >= 0) {
        if (match == 0) {
            index = match
            value = list[index]
        }
        else {
            index = match - 1
            value = list[index]
        }
    } else {
        index = 3
        value = list[index]
    }
    index = index + inputStartIndex
    return {
        index,
        value
    }
}



// const NxTable: Record<string, number> = {
//     "0": 1,
//     "1": 1,
//     "2": 2,
//     "3": 6,
//     "4": 24,
//     "5": 120,
//     "6": 720,
//     "7": 5040
// }

const NfTable: Record<string, number> = {
    "0": 1,
    "1": 2,
    "2": 4,
    "3": 8,
    "4": 16,
    "5": 32,
    "6": 64,
    "7": 128
}
const IdCountTable: Record<string, number> = {
    "1": 0,
    "2": 1,
    "4": 2,
    "8": 3,
    "16": 4,
    "32": 5,
    "64": 6,
    "128": 7
}
// ReverseIdCountTable()

const NfTableArray: number[] = [1, 2, 4, 8, 16, 32, 64, 128].reverse()
const MaskPrefixTable: number[] = [128, 192, 224, 240, 248, 252, 254, 255]

export function SumArray(arr: number[], end: number = -1) {
    let s = 0;
    let inputEnd = end > -1 ? end : arr.length - 1;
    for (let i = inputEnd; i >= 0; i--) {
        s += arr[i];
    }
    return s;
}
export function ReverseIdCountTable(table: Record<string, number>) {
    let res: Record<string, number> = {}
    let list = Object.keys(table)
    list.forEach((k) => {
        let v = table[k]
        res[String(v)] = Number(k)
    })
    return res
}

export function Mask2Cidr(mask: string, startIndex: number | string = 0) {
    let stdStartIndex = PreferValueAsNumber(startIndex)
    let parsedMask = ParseMask(mask, startIndex)
    // log(parsedMask);
    let prefix = (parsedMask.index - stdStartIndex) * 8 + MaskPrefixTable.indexOf(Number(parsedMask.value)) + 1
    // log(`[info] network prefix: ${prefix}`)
    return prefix
}



// prefix is alias of cidr
export function CodeCidr(value: string | number) {
    return PreferValueAsString(value)
}
export function Cidr2MaskIndex(value: string | number, startIndex: number | string = 0) {
    let cidr = PreferValueAsNumber(value)
    let index: number = 3
    let list = [8, 16, 24, 32]
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (cidr < element) {
            index = i
            break
        }
    }
    index += PreferValueAsNumber(startIndex)
    return index
}
// mask-index is similiar to mask-type

// snil
export function Cidr2Snil(cidr: number | string, index?: number) {
    // cidr-> mask-index
    // cidr + mask-index -> snil
    let stdCidr = PreferValueAsNumber(cidr)
    let snil = (stdCidr - 1) - (index != undefined ? index : Cidr2MaskIndex(cidr)) * 8
    return snil
}

/**
 * 
 * @sample
 * ```
 * Cidr2MaskValue(27,3)
 * ```
 */
export function Cidr2MaskValue(cidr: number | string, index?: number) {
    // cidr-> mask-index
    // cidr + mask-index -> snil
    // snil + snil-mask-table -> mask-value

    let snil = Cidr2Snil(cidr, index != undefined ? index : Cidr2MaskIndex(cidr))
    return SumArray(NfTableArray, snil)
}
// cidr-> mask-index

export function ParseCidr(cidr: number | string) {
    let index = Cidr2MaskIndex(cidr)
    let value = String(Cidr2MaskValue(cidr, index))
    return { index, value }
}

/**
 * 
 * @sample
 * ```
 * Cidr2Mask(27)
 * ```
 */
export function Cidr2Mask(cidr: number | string) {
    let index = Cidr2MaskIndex(cidr)
    let value = Cidr2MaskValue(cidr, index)
    return CodeMask(index, value)
}


// debuger,coder

function GetSubNwCountCidr(cidr: number | string = 24, index: number | string = 3) {
    // let inputCidr = PreferValueAsNumber(cidr)
    // return (PreferValueAsNumber(max) - inputCidr) * 2
    let inputCidr = PreferValueAsNumber(cidr)
    return 2 ** (inputCidr - PreferValueAsNumber(index) * 8)
}
// sub network id length, for short snil
function GetSnilWhenRequireSubNwCount(count: number | string) {
    let inputCount = PreferValueAsNumber(count)
    let list = NfTableArray.filter(v => v >= inputCount)
    // get last
    let last = list[list.length - 1]
    return NfTableArray.reverse().indexOf(last)
}
// 256 - 192=64

function GetSubNwIpCountCidr(cidr: number | string = 24, max: number | string = 32) {
    let inputCidr = PreferValueAsNumber(cidr)
    return (PreferValueAsNumber(max) - inputCidr) * 2
}

function RequireIpCount(count: number | string) {

}
/**
 * 
 * @sample
 * ```
 * GetNwChunk(128) //[0,128]
 * GetNwChunk(192) //[0,64,128,192]
 * GetNwChunk(240) 
 * ```
 */
export function GetNwChunk(maskValue: number | string) {
    let base = 256 - PreferValueAsNumber(maskValue)
    let c = parseInt(String(256 / base))
    let res: number[] = []
    for (let index = 0; index < c; index++) {
        res.push(base * index)
    }
    return res
}

export function GetNwChunkOfBroadcast(nwChunk: number[]) {
    let res: number[] = []
    for (let i = 0; i < nwChunk.length; i++) {
        if (i == nwChunk.length - 1) {
            res[i] = 255
        } else {
            res[i] = nwChunk[i + 1] - 1
        }
    }
    return res
}

export function GetNwChunkOfGateway(nwChunk: number[]) {
    let res: number[] = []
    for (let i = 0; i < nwChunk.length; i++) {
        res[i] = nwChunk[i]
    }
    return res
}

export function GetNwChunkOfIp(nwChunk: number[]) {
    let res: string[] = []
    let cgw = GetNwChunkOfGateway(nwChunk)
    let cbc = GetNwChunkOfBroadcast(nwChunk)
    res = cgw.map((v, k) => {
        return [v + 1, cbc[k] - 1].join('-')
    })
    return res
}

interface ParseMaskResult { index: number, value: string }

export function GetIpHead(ip: string, parsedMask: ParseMaskResult) {
    return ip.split(".").slice(0, parsedMask.index + 1).join('.')
}
export function GetSubNwIpList(ipHead: string, NwChunkOfIp: string[]) {
    // let head = GetIpHead(ip)
    return NwChunkOfIp.map(v => {
        return [ipHead, v].join('.')
    })
}

const { log } = console
// let n = 2
// let nx = fac(n)
// // log(nx)
// // log(`[info] math: ${n}! = ${nx}`)

// let nxTable: Record<string, number> = {}
// let maskPreferTable: number[] = []
// for (let index = 0; index < 8; index++) {
//     n = index
//     // log(`[info] math: ${n}! = ${fac(n)}`)
//     // log(`'${n}':${fac(n)}`)
//     // nxTable[`${n}`] = fac(n)
//     nxTable[`${n}`] = 2 ** n
//     // NfTableArray[index] = 2 ** n
//     maskPreferTable[n] = SumArray(NfTableArray, n)

// }
// log(JSON.stringify(nxTable, null, 2))
// log(JSON.stringify(NfTableArray, null, 0))
// log(JSON.stringify(maskPreferTable, null, 0))
// log(JSON.stringify(ReverseIdCountTable(NfTable), null, 2))



// todo: yours code-nw-mask --index 2 --value 240 --start-index 0
// let nwMask = CodeMask(2, 240, 0)
// log(`[info] network mask: ${nwMask}`)

// todo: yours nw-mask-to-prefix --nw-mask 255.255.240.0
// let prefix = MaskToPrefix(nwMask)
// log(`[info] network prefix: ${prefix}`)


/**
 * 
 * @sample
 * ```
 * DivideNw('172.17.0.0/17')
 * DivideNw('172.17.0.0 255.255.128.0')
 * ``` 
 */
function DivideNw(ipmask: string) {
    // feat(core): enable 'ip mask' as input
    // feat(core): enable 'ip/mask' as input

    let ip: string = '';
    let mask: string = '';
    let cidr: string | number = ''
    let pmRes: ParseMaskResult
    if (ipmask.indexOf('/') > 0) {
        // '172.17.0.0/20' -> ['172.17.0.0','20']
        ([ip, cidr] = ipmask.trim().replace(/ ?/, '').split('/'));
        // let index = Cidr2MaskIndex(mask)
        // pmRes = { index, value: String(Cidr2MaskValue(mask, index)) }
        pmRes = ParseCidr(cidr)
        mask = CodeMask(pmRes.index, pmRes.value)
        // prefix = Number(mask)
    } else {
        // '172.17.0.0 255.255.128.0' -> ['172.17.0.0','255.255.128.0]
        ([ip, mask] = ipmask.trim().replace(/ +/, ' ').split(' '));
        pmRes = ParseMask(mask, 0)
    }

    cidr = Mask2Cidr(mask)
    // log(parsedMask)

    log(`[info] network ip: ${ip}`)
    log(`[info] network mask: ${mask}`)
    // log(pmRes)
    log(`[info] network cidr: ${cidr}`)
    let SubNwCountMax = GetSubNwCountCidr(cidr, pmRes.index)
    log(`[info] sub network count max: ${SubNwCountMax}`)

    let c = GetNwChunk(pmRes.value)
    log(`[info] sub network chunk: ${c.join(',')}`)

    // let cgw = GetNwChunkOfGateway(c)
    // log(`[info] sub network chunk of gateway: ${cgw.join(',')}`)

    // let cbc = GetNwChunkOfBroadcast(c)
    // log(`[info] sub network chunk of broacast: ${cbc.join(',')}`)

    let cip = GetNwChunkOfIp(c)
    log(`[info] sub network chunk of ip: ${cip.join(',')}`)

    // let ip: string = '172.26.176.1'

    let ipHead = GetIpHead(ip, pmRes)
    // log(parsedMask.index)
    let iph = GetSubNwIpList(ipHead, cip)
    log(`[info] sub network chunk of ip list: ${iph.join(',')}`)
}
// DivideNw('172.17.0.0 255.255.128.0')
// DivideNw('172.17.0.0/17')
// DivideNw('172.26.176.1 255.255.240.0')
// DivideNw('172.26.176.30/20')

// todo: yours nw-sub-count


// ipv4
// 172.26.176.1

// tsx src/network-util.ts