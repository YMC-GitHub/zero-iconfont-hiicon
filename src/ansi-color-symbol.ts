// color-symbl
const isDefined = (s: any) => typeof s !== 'undefined'
const mergeObject = (...objs: any) => Object.assign({}, ...objs)
const isHyper = isDefined(process) && process.env.TERM_PROGRAM === 'Hyper'
const isWindows = isDefined(process) && process.platform === 'win32'
const isLinux = isDefined(process) && process.platform === 'linux'

type ColorSymbols = Record<string, string>
export const common: ColorSymbols = {
    ballotDisabled: '☒',
    ballotOff: '☐',
    ballotOn: '☑',
    bullet: '•',
    bulletWhite: '◦',
    fullBlock: '█',
    heart: '❤',
    identicalTo: '≡',
    line: '─',
    mark: '※',
    middot: '·',
    minus: '－',
    multiplication: '×',
    obelus: '÷',
    pencilDownRight: '✎',
    pencilRight: '✏',
    pencilUpRight: '✐',
    percent: '%',
    pilcrow2: '❡',
    pilcrow: '¶',
    plusMinus: '±',
    question: '?',
    section: '§',
    starsOff: '☆',
    starsOn: '★',
    upDownArrow: '↕'
}

export const windows: ColorSymbols = mergeObject(common, {
    check: '√',
    cross: '×',
    ellipsisLarge: '...',
    ellipsis: '...',
    info: 'i',
    questionSmall: '?',
    pointer: '>',
    pointerSmall: '»',
    radioOff: '( )',
    radioOn: '(*)',
    warning: '‼'
})

export const other: ColorSymbols = mergeObject(common, {
    ballotCross: '✘',
    check: '✔',
    cross: '✖',
    ellipsisLarge: '⋯',
    ellipsis: '…',
    info: 'ℹ',
    questionFull: '？',
    questionSmall: '﹖',
    pointer: isLinux ? '▸' : '❯',
    pointerSmall: isLinux ? '‣' : '›',
    radioOff: '◯',
    radioOn: '◉',
    warning: '⚠'
})
const colorSymbols = isWindows && !isHyper ? windows : other
Reflect.defineProperty(colorSymbols, 'common', { enumerable: false, value: common })
Reflect.defineProperty(colorSymbols, 'windows', { enumerable: false, value: windows })
Reflect.defineProperty(colorSymbols, 'other', { enumerable: false, value: other })
export { colorSymbols }
