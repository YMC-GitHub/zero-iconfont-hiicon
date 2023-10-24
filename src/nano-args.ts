/* eslint-disable no-use-before-define,no-restricted-syntax */
type ParseValueResult = string|number|boolean
type val = boolean | number | string | undefined
type key = string
type newargs = [key, val][]

export type Flags = Record<string, ParseValueResult>
// export type _ = string[]
// export type Extras = string[]
export type _ = ParseValueResult[]
export type Extras =  ParseValueResult[]
export type NanoArgsData = {
    flags: Flags;
    _: ParseValueResult[];
    extras: ParseValueResult[];
}

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
    const _: string[] = [];

    // feat(nano-parse): support extras when '--' bind to ouput.extras
    ({ extras, args } = getExtras(handledInput));

    // console.log(handledInput, extras, args)
    const cmdArgs: any[] = []
    /* eslint-disable no-plusplus */
    for (let i = 0; i < args.length; i++) {
        const previous = args[i - 1]
        const curr = args[i]
        const next = args[i + 1]

        // eg:ymc.rc.json
        const nextIsValue = next && !/^--.+/.test(next) && !/^-.+/.test(next)

        const pushWithNext = (x: string) => {
            //[string,boolean]
            //[string,string]
            cmdArgs.push([x, nextIsValue ? next : true])
        }

        // case: key val exp. eg:--conf=ymc.rc.json -f=ymc.rc.json
        if (/^--.+=/.test(curr) || /^-.=/.test(curr)) {
            //string[]
            cmdArgs.push(curr.split('='))
        } else if (/^-[^-].*/.test(curr)) {
            //case: key exp . eg: -xyz

            let current = curr

            if (current.includes('=')) {
                const index = current.indexOf('=')
                cmdArgs.push([current.slice(index - 1, index), current.slice(index + 1, index + 2)])
                current = current.slice(0, index - 1) + current.slice(index + 2)
            }

            // Push all the flags but the last (ie x and y of -xyz) with true
            const xyz = current.slice(1).split('').slice(0, -1)
            // eslint-disable no-restricted-syntax
            for (const char of xyz) {
                //[string,true]
                cmdArgs.push([char, true])
            }

            // If the next string is a value, push it with the last flag
            const final = current[current.length - 1]
            pushWithNext(final)
        } else if (/^--.+/.test(curr) || /^-.+/.test(curr)) {
            //case: key val exp . eg: -help true, --help true, -h true
            pushWithNext(curr)
        } else {

            let valueTaken = cmdArgs.find(arg => arg[0] === previous)

            if (!valueTaken && /^-./.test(previous)) {
                const previousChar = previous[previous.length - 1]
                valueTaken = cmdArgs.find(arg => arg[0] === previousChar)
            }
            //case: only key or  exp . eg: a b c 
            if (!valueTaken) {
                _.push(curr)
            }
        }
    }

    // get flags
    const flags = getFlags(cmdArgs)
    return {
        flags,
        _: _.map(value => parseValue(value)),
        extras: extras.map(value => parseValue(value))
    }
}

function getFlags(newArgs: newargs) {
    //[key,val][]
    const flags: Flags = {}
    for (const arg of newArgs) {
        let key: string = arg[0].replace(/^-{1,2}/g, '')
        let value = arg[1] //string|boolean|number|undefined
        //case: with no-prefix. eg: --no-debug
        //[undefined, true].includes(value)

        if (key.startsWith('no-') && valIsOneOf(value, [undefined, true])) {
            key = key.slice(3)
            value = false
        }

        flags[key] = parseValue(value)
    }
    return flags
    function valIsOneOf(val: val, list: val[]) {
        return list.includes(val)
    }
}
function getExtras(handledInput: string[]) {
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
