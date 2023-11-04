import { camelize } from "./string"


export interface ObjectSelectKeysOption {
    keys: string,
    sep: string | RegExp
    // todo:
    getValueInAliasWhen: 'name-not-in-data' | 'false-in-data' | 'undefined-in-data'
    newKey: 'alias-is-newkey'
}

export type ObjectSelectKeysOptionLike = Partial<ObjectSelectKeysOption>
export const builtinObjectSelectKeysOption = { keys: '', sep: ',', getValueInAliasWhen: 'false-in-data', newKey: 'alias-is-newkey' }

// ns:ObjectSelectKeys
export type ObjectSelectKeysData = Record<string, any>

/**
 * get obj only selected keys
 * @sample
 * ```
 * objectSelectKeys(option, 'commentReg, ignoreComment')
 * objectSelectKeys(option, '{text:filetext,commentReg, ignoreComment}')
 * ```
 */
export function objectSelectKeys(data: ObjectSelectKeysData, options: string | ObjectSelectKeysOptionLike) {

    const res: ObjectSelectKeysData = {}
    let option = {
        ...builtinObjectSelectKeysOption,
        ...(options ? ((typeof options === 'string') ? { keys: options } : options) : {})
    }
    let { keys, sep } = option

    keys.replace(/(^ ?{)|(} ?$)/gi, '')
        .split(sep)
        .forEach(key => {
            // get key name and key alias
            let [alias, name] = getKeyName(key)

            // get val by key
            const val = name ? data[name] : data[alias]
            if (val !== undefined) {
                // feat: set val bind new name
                res[alias] = val
            }
        })
    return res
}

// 'text:filetext' -> ['text','filetext']
function getKeyName(key: string) {
    let [alias, name] = key
        .trim()
        .split(':')
        .map(v => v.trim())
    return [alias, name]
}


/**
 * get keys from object - ts omit like
 * @sample
 * ```
 * let data = {a:'b',c:0,d:false}
 * objectOmit(data,'b,c,d')// 'a'
 * objectOmit(data,'a*')// 'a'
 * ```
 */
export function objectOmit(data: ObjectSelectKeysData, keys: string) {
    let list: string[] = Object.keys(data)
    let input: string[] = keys.split(",").map(v => v.trim()).filter(v => v)
    // 
    // list = list.filter(vl => !input.includes(vl))

    let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
    list = list.filter(vl => inputReg.some(reg => reg.test(vl)))


    return list.join(',')
}

/**
 * get keys from object - ts pick like
 * @sample
 * ```
 * let data = {a:'b',c:0,d:false}
 * objectPick(data,'b,c,d,e')// 'b,c,d'
 * ```
 */
export function objectPick(data: ObjectSelectKeysData, keys: string) {
    let list: string[] = Object.keys(data)
    let input: string[] = keys.split(",").map(v => v.trim()).filter(v => v)
    // list = list.filter(vl => input.includes(vl))
    let inputReg = input.map(v => v.replace(/\*/g, '.*')).map(v => new RegExp(`^${v}`))
    list = list.filter(vl => !inputReg.some(reg => reg.test(vl)))
    return list.join(',')
}


/**
 * get obj val only in values  - ts extract like
 * @sample
 * ```
 * // {a:'b',c:'',d:undefined} ->  {a:'b',c:''}
 * objectExtract({a:'b',c:'',d:undefined},[''])
 * ```
 */
export function objectExtract(data: ObjectSelectKeysData, values: any = [undefined]) {
    const res: ObjectSelectKeysData = {}
    Object.keys(data).forEach(v => {
        let val = data[v]
        if (values.includes(val)) {
            res[v] = val
        }
    })
    return res
}

/**
 * get obj val that not in values  - ts exclude like
 * @sample
 * ```
 * // {a:'b',c:'',d:undefined} ->  {a:'b',c:''}
 * objectExclude({a:'b',c:'',d:undefined},[undefined])
 * ```
 */
export function objectExclude(data: ObjectSelectKeysData, values: any = [undefined]) {
    const res: ObjectSelectKeysData = {}
    Object.keys(data).forEach(v => {
        let val = data[v]
        if (!values.includes(val)) {
            res[v] = val
        }
    })
    return res
}


/**
 * del key prefix in object
 * @sample
 * ```
 * // {adck:'b'} ->  {k:'b'}
 * objectShort({a:'b',c:'',d:undefined},'abc')
 * ```
 */
export function objectShort(data: ObjectSelectKeysData, prefix: string = '') {
    const res: ObjectSelectKeysData = {}
    if (!prefix) return data
    Object.keys(data).forEach(key => {
        let val = data[key]
        key = key.replace(new RegExp(`^${prefix}`), '')
        res[key] = val
    })
    return res
}


/**
 * add key prefix in object
 * @sample
 * ```
 * 
 * //  {k:'b'} -> {adck:'b'}
 * objectLong({k:'b'},'abc')
 * ```
 */
export function objectLong(data: ObjectSelectKeysData, prefix: string = '') {
    const res: ObjectSelectKeysData = {}
    if (!prefix) return data
    Object.keys(data).forEach(key => {
        let val = data[key]
        key = key.replace(new RegExp(`^(${prefix})*`), prefix)
        res[key] = val
    })
    return res
}



export interface CamelizeOption {
    noAutoCamelize: boolean,
    slim: boolean
}
export type CamelizeFlagsOptionLike = Partial<CamelizeOption>
type PlainObject = Record<string, any>

export function objectCamelize(data: PlainObject = {}, options: CamelizeFlagsOptionLike = {}) {
    // let res = {}
    const option: CamelizeOption = {
        slim: true,
        noAutoCamelize: false,
        ...options
    }
    if (option.noAutoCamelize) return data
    Object.keys(data).forEach(k => {
        const ck = camelize(k)
        // res[ck]=flags[k]
        if (ck !== k) {
            data[ck] = data[k]
            if (option.slim) {
                delete data[k]
            }
        }
    })
    return data
}

export interface StylizeOption {
    // noAutoStylize?: boolean,
    slim: boolean
    style: string
    styleHandle?: (s: string) => string
}
export type StylizeOptionike = Partial<StylizeOption>

/**
 * 
 * @sample
 * ```
 * 
 * ```
 */
export function objectStylize(data: PlainObject = {}, options = {}) {
    // let res = {}
    const option: StylizeOption = {
        slim: true,
        style: 'camelize', // get more infomation on extend-string
        styleHandle: undefined,
        // noAutoCamelize: false,
        ...options
    }
    // @ts-ignore
    if (option[camelize(`noAuto-${options.style}`)]) return data
    // @ts-ignore
    let stylize = option.styleHandle ? option.styleHandle : String.prototype[option.style]
    if (!stylize) stylize = (v: string) => v
    // typeof stylize !== "function"
    Object.keys(data).forEach(str => {
        const ck = stylize(str)
        // res[ck]=flags[k]
        if (ck !== str) {
            data[ck] = data[str]
            if (option.slim) {
                delete data[str]
            }
        }
    })
    return data
}



function isObject(value: any) {
    const valueType = typeof value
    return (valueType !== null && typeof value === 'object' || typeof value === 'function')
}


export function deepClone(originValue: any) {
    if (!(isObject(originValue))) return originValue
    const newObject: any = {}
    for (const key in originValue) {
        newObject[key] = deepClone(originValue[key])
    }
    return newObject
}


/**
 * 
 * these is specific: Date,Buffer,RegExp
 */
function isSpecificValue(val: any) {
    return (
        val instanceof Buffer
        || val instanceof Date
        || val instanceof RegExp
    ) ? true : false;
}

function cloneSpecificValue(val: any) {
    if (val instanceof Buffer) {
        let x = Buffer.alloc
            ? Buffer.alloc(val.length)
            : new Buffer(val.length);
        val.copy(x);
        return x;
    } else if (val instanceof Date) {
        return new Date(val.getTime());
    } else if (val instanceof RegExp) {
        return new RegExp(val);
    } else {
        throw new Error('Unexpected situation');
    }
}

/**
 * Recursive cloning array.
 */
function deepCloneArray(arr: any[]) {
    let clone: any[] = [];
    arr.forEach(function (item, index) {
        if (typeof item === 'object' && item !== null) {
            // array,plain object,spec value
            if (Array.isArray(item)) {
                clone[index] = deepCloneArray(item);
            } else if (isSpecificValue(item)) {
                clone[index] = cloneSpecificValue(item);
            } else {
                clone[index] = objectExtend([{}, item]);
            }
        } else {
            // string,number,bool
            clone[index] = item;
        }
    });
    return clone;
}


function safeGetProperty(object: PlainObject, property: string) {
    return property === '__proto__' ? undefined : object[property];
}

export function objectExtend(args: any[]) {
    if (args.length < 1 || typeof args[0] !== 'object') {
        return false;
    }

    if (args.length < 2) {
        return args[0];
    }

    let target = args[0];

    // convert arguments to array and cut off target object
    let other = args.slice(1);

    let val, src, clone;

    other.forEach(function (obj) {
        // skip argument if isn't an object, is null, or is an array
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            return;
        }

        Object.keys(obj).forEach(function (key) {
            src = safeGetProperty(target, key); // source value
            val = safeGetProperty(obj, key); // new value

            // recursion prevention
            if (val === target) {
                return;

                /**
                 * if new value isn't object then just overwrite by new value
                 * instead of extending.
                 */
            } else if (typeof val !== 'object' || val === null) {
                target[key] = val;
                return;

                // just clone arrays (and recursive clone objects inside)
            } else if (Array.isArray(val)) {
                target[key] = deepCloneArray(val);
                return;

                // custom cloning and overwrite for specific objects
            } else if (isSpecificValue(val)) {
                target[key] = cloneSpecificValue(val);
                return;

                // overwrite by new value if source isn't object or array
            } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                target[key] = objectExtend([{}, val]);
                return;

                // source value and new value is objects both, extending...
            } else {
                target[key] = objectExtend([src, val]);
                return;
            }
        });
    });

    return target;
};

// select,del-prefix,style
// let data: any = { k: 'b' }
// data = objectLong(data, 'abc')
// data = objectLong(data, 'abc')
// data = objectShort(data, 'abc')
// data = objectStylize(data)
// const { log } = console
// log(data)
// tsx src/object.ts