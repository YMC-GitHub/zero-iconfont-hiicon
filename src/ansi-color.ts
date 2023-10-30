
import { other } from "./ansi-color-symbol"
export type ColorCodes = [number, number]
export type Color = [name: string, code: ColorCodes, note: string]
const colors: Color[] = [
    ['reset', [0, 0], 'modifier'],
    ['bold', [1, 22], 'modifier'],
    ['dim', [2, 22], 'modifier'],
    ['italic', [3, 23], 'modifier'],
    ['underline', [4, 24], 'modifier'],
    ['inverse', [7, 27], 'modifier'],
    ['hidden', [8, 28], 'modifier'],
    ['strikethrough', [9, 29], 'modifier'],

    ['black', [30, 39], 'color'],
    ['red', [31, 39], 'color'],
    ['green', [32, 39], 'color'],
    ['yellow', [33, 39], 'color'],
    ['blue', [34, 39], 'color'],
    ['magenta', [35, 39], 'color'],
    ['cyan', [36, 39], 'color'],
    ['white', [37, 39], 'color'],
    ['gray', [90, 39], 'color'],
    ['grey', [90, 39], 'color'],

    ['bgBlack', [40, 49], 'bg'],
    ['bgRed', [41, 49], 'bg'],
    ['bgGreen', [42, 49], 'bg'],
    ['bgYellow', [43, 49], 'bg'],
    ['bgBlue', [44, 49], 'bg'],
    ['bgMagenta', [45, 49], 'bg'],
    ['bgCyan', [46, 49], 'bg'],
    ['bgWhite', [47, 49], 'bg'],

    ['blackBright', [90, 39], 'bright'],
    ['redBright', [91, 39], 'bright'],
    ['greenBright', [92, 39], 'bright'],
    ['yellowBright', [93, 39], 'bright'],
    ['blueBright', [94, 39], 'bright'],
    ['magentaBright', [95, 39], 'bright'],
    ['cyanBright', [96, 39], 'bright'],
    ['whiteBright', [97, 39], 'bright'],

    ['bgBlackBright', [100, 49], 'bgBright'],
    ['bgRedBright', [101, 49], 'bgBright'],
    ['bgGreenBright', [102, 49], 'bgBright'],
    ['bgYellowBright', [103, 49], 'bgBright'],
    ['bgBlueBright', [104, 49], 'bgBright'],
    ['bgMagentaBright', [105, 49], 'bgBright'],
    ['bgCyanBright', [106, 49], 'bgBright'],
]

// plain text -> ascii color text



export function decodeColor(s: string) {
    const ANSI_REGEX =
        /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g
    return s.replace(ANSI_REGEX, '')
}
export function encodeColor(s: string, colorName: string = 'white') {

    // let names = colors.map(v => v[0])
    // let color = colors[11]
    // let [name, code, note] = color
    // log(`[info] color names: `, names)

    // get color from colors by color name
    let [color] = colors.filter(v => v[0] == colorName)
    if (!color) color = colors[8]


    let [name, code, note] = color
    let open = `\u001b[${code[0]}m`
    let close = `\u001b[${code[1]}m`
    let closeReg = new RegExp(`\\u001b\\[${code[1]}m`, 'g')
    const wrap = (input: string, newline?: boolean) => {
        // feat: wrap text to terminal color
        if (input.includes(close)) input = input.replace(closeReg, close + open)
        const output = open + input + close
        // feat: auto newline when symbol in text
        return newline ? output.replace(/\r?\n/g, `${close}$&${open}`) : output
    }
    return wrap(s)
}


// const { log } = console
// // log(wrap(`hi`))
// // log(decodeColor(wrap(`hi`)))
// let text: string = `[info]`
// text = other.check
// text = other.cross
// text = [other.radioOn, other.radioOn].join(' -> ')


// log(text)
// text = encodeColor(text, 'green')
// log(text)
// text = decodeColor(text)
// log(text)

// tsx src/ansi-color.ts