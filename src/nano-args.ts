/* eslint-disable no-use-before-define,no-restricted-syntax */
type ParseValueResult = string | number | boolean
type val = boolean | number | string | undefined
type key = string
type newargs = [key, val][]

export type Flags = Record<string, ParseValueResult>
// export type _ = string[]
// export type Extras = string[]
export type _ = ParseValueResult[]
export type Extras = ParseValueResult[]
export type NanoArgsData = {
    flags: Flags;
    _: ParseValueResult[];
    extras: ParseValueResult[];
}

type ArgsKvArr = [string, string][]
// string[][]

const { log } = console
/**
 * parse cli cmd string
 * @param {string|string[]} input
 * @sample
 * ```
 * nanoargs(`ns cmd -a -b -c -- -a -b -c`)
 * nanoargs(`ns subns cmd -a -b -c -- -a -b -c`)
 * nanoargs(`ns subns subcmd -a -b -c -- -a -b -c`)
 * ```
 */
export default function nanoargs(input: string | string[]) {
    //note:
    //nomalize input to string array
    //prefer input to string array
    //if input is string , will split to string array with 1+ space
    const handledInput = Array.isArray(input) ? input : input.split(/ +/)

    let extras: string[] = [];
    let args = handledInput;
    let _: string[] = [];

    // feat(nano-parse): support extras when '--' bind to ouput.extras
    // args = getArgs(handledInput);
    // extras = getExtras(handledInput);
    ({ extras, args } = getArgsAndExtras(handledInput));

    // console.log(handledInput, extras, args)
    let cmdArgs: any[] = [];
    ({ cmdArgs, _ } = prepareFlags(args))

    // get flags
    const flags = getFlags(cmdArgs)
    return {
        flags,
        _: _.map(value => parseValue(value)),
        extras: extras.map(value => parseValue(value))
    }
}

/**
 * 
 * @sample
 * ```
 * //[['name':'hi']] -> {name:'hi'}
 * getFlags([['name':'hi']])
 * //[['no-trim',true]] -> {trim:false}
 * 
 * //[['no-trim',undefined]] -> {trim:false}
 * ```
 */
export function getFlags(newArgs: newargs) {
    //[key,val][]
    const flags: Flags = {}
    for (const arg of newArgs) {
        // --name -> name
        let key: string = arg[0].replace(/^-{1,2}/g, '')

        let value = arg[1] //string|boolean|number|undefined
        //case: with no-prefix. eg: --no-debug
        //[undefined, true].includes(value)

        if (key.startsWith('no-') && valIsOneOf(value, [undefined, true])) {
            // no-trim -> trim
            key = key.slice(3)
            value = false
        }

        flags[key] = parseValue(value)
        // flags[key] = value
    }
    return flags
    function valIsOneOf(val: val, list: val[]) {
        return list.includes(val)
    }
}

/**
 * 
 * @sample
 * ```
 * // ['a','--','a1','b1'] -> args:['a']
 * ``` 
 */
export function getArgs(handledInput: string[]) {
    let args: string[] = handledInput
    // feat(nano-parse): support extras when '--' bind to ouput.extras
    if (handledInput.includes('--')) {
        args = handledInput.slice(0, handledInput.indexOf('--'))
    }
    return args
}


/**
 * 
 * @sample
 * ```
 * // ['a','--','a1','b1'] -> ['a1','b1']
 * ``` 
 */
export function getExtras(handledInput: string[]) {
    let extras: string[] = []
    // feat(nano-parse): support extras when '--' bind to ouput.extras
    if (handledInput.includes('--')) {
        extras = handledInput.slice(handledInput.indexOf('--') + 1)
    }
    return extras
}


/**
 * 
 * @sample
 * ```
 * // ['a','--','a1','b1'] -> {args:['a'],extras:['a1','b1']}
 * ``` 
 */
export function getArgsAndExtras(handledInput: string[]) {
    let extras: string[] = []
    let args: string[] = handledInput
    // feat(nano-parse): support extras when '--' bind to ouput.extras
    if (handledInput.includes('--')) {
        extras = handledInput.slice(handledInput.indexOf('--') + 1)
        args = handledInput.slice(0, handledInput.indexOf('--'))
    }
    return { extras, args }
}


/**
 * cli value to node.js boolean , string or number
 * @sample
 * ```
 * //'false' -> flase
 * parseValue('false')
 * 
 * //'1' -> 1
 * ```
 */
function parseValue(thing: any): ParseValueResult {
    // case:  exp for true. eg: true-string or true-boolean ( or other custom exp(todo))
    if (['true', true].includes(thing)) {
        return true
    }

    // case:  exp for false.
    if (['false', false].includes(thing)) {
        return false
    }

    // case:  exp for number.
    if (Number(thing)) {
        return Number(thing)
    }
    // case: other string
    return thing
}
function prepareFlags(args: string[]) {
    const cmdArgs: ArgsKvArr = []
    // const store: [[string, boolean | string]] = []
    const _: string[] = [];

    /* eslint-disable no-plusplus */
    for (let i = 0; i < args.length; i++) {
        // cache prev,curr,next
        const prev = args[i - 1]
        const curr = args[i]
        const next = args[i + 1]

        // when args=['--file', 'ymc.rc.json'] -> true
        // when args=['--file', ''] -> false
        const nextIsValue = getNextValueType(next)
        // const nextIsValue = next && !/^--.+/.test(next) && !/^-.+/.test(next)

        // const pushWithNext = (x: string) => {
        //     //[string,boolean]
        //     //[string,string]
        //     cmdArgs.push([x, nextIsValue ? next : true])
        // }


        if (/^--.+=/.test(curr) || /^-.=/.test(curr)) {
            // --conf=ymc.rc.json
            // when args=['--conf=ymc.rc.json'] -> [['--conf','ymc.rc.json']]
            // @ts-ignore
            cmdArgs.push(curr.split('='))
            // log(`[info] like -f=ymc.rc.json : `, curr, curr.split('='))
            // log(`[info] like --conf=ymc.rc.json : `, curr, curr.split('='))

        } else if (/^-[^-].*/.test(curr)) {
            //case: key exp . eg: -xyz
            // when args=['-xyz'] -> [['','ymc.rc.json']]
            let current = curr

            if (current.includes('=')) {
                // log(`[info] like -a=b : `, current)
                //when args=['-x=b'] -> [['-x','b']]?
                const index = current.indexOf('=')
                cmdArgs.push([current.slice(index - 1, index), current.slice(index + 1, index + 2)])
                current = current.slice(0, index - 1) + current.slice(index + 2)
            }

            // when args=['-xyz'] -> [['x','true'],['y','true'],['z','true']]
            // Push all the flags but the last (ie x and y of -xyz) with true
            const xyz = current.slice(1).split('').slice(0, -1)
            // eslint-disable no-restricted-syntax
            for (const char of xyz) {
                //[string,true]
                cmdArgs.push([char, 'true'])
                // log(`[info] like -xyz : `, current, [char, 'true'])
            }

            // If the next string is a value, push it with the last flag
            const final = current[current.length - 1]
            // pushWithNext(final)
            pushWithNext(cmdArgs, final, next, nextIsValue)
            // log(`[info] like -xyz : `, current, [final, getKvValue(next, nextIsValue)])
        } else if (/^--.+/.test(curr) || /^-.+/.test(curr)) {
            //case: key val exp . eg: -help true, --help true, -h true
            // when args=['--help'] -> [['--help','true']]
            // pushWithNext(curr)
            pushWithNext(cmdArgs, curr, next, nextIsValue)
            // log(`[info] like --name [value], -n [value]: `, curr, [curr, getKvValue(next, nextIsValue)])
        } else {

            let valueTaken = cmdArgs.find(arg => arg[0] === prev)

            if (!valueTaken && /^-./.test(prev)) {
                const previousChar = prev[prev.length - 1]
                valueTaken = cmdArgs.find(arg => arg[0] === previousChar)
            }
            //case: only key or  exp . eg: a b c 
            if (!valueTaken) {
                _.push(curr)
            }
        }
    }
    return { cmdArgs, _: _ }


    function getNextValueType(input: string) {
        return input && !/^--.+/.test(input) && !/^-.+/.test(input)
    }
    function getKvValue(next: string, nextIsValue: boolean | '') {
        return nextIsValue ? next : 'true'
    }
    function pushWithNext(store: ArgsKvArr, name: string, next: string, nextIsValue: boolean | '') {
        let value = getKvValue(next, nextIsValue)
        store.push([name, value])
    }
}