import {
    // extendStringPrototype,
    humanize,
    slugify,
    camelize,
    underscoped,
    classify,
    swapCase,
    capitialize,
    sentence,
    titleize,
    padStartString,
    padEndString
} from './string'

/**
 *
 * @param {string} name
 * @param {()=>{}} handle
 */
function extendStringPrototype(name: string, handle: (...args: any[]) => string) {
    // get its prototype
    const toBeExtended = String.prototype
    // @ts-ignore
    if (!toBeExtended[name]) {
        // tobeExtende[name] = function(){return handle(this)}
        // function (...args){return padEndString(this,...args)}
        // @ts-ignore
        toBeExtended[name] = function (...args) {
            return handle(this, ...args)
        }
    }
    // String.prototype.humanize= function(){return humanize(this)}
}


extendStringPrototype('humanize', humanize)
extendStringPrototype('slugify', slugify)
extendStringPrototype('dasherize', slugify)
extendStringPrototype('camelize', camelize)
extendStringPrototype('underscoped', underscoped)
extendStringPrototype('classify', classify)
extendStringPrototype('swapCase', swapCase)
extendStringPrototype('capitialize', capitialize)
extendStringPrototype('sentence', sentence)
extendStringPrototype('titleize', titleize)
extendStringPrototype('padStartString', padStartString)
extendStringPrototype('padStart', padStartString)
extendStringPrototype('padEndString', padEndString)
extendStringPrototype('padEnd', padEndString)

export {
    extendStringPrototype,
    humanize,
    slugify,
    slugify as dasherize,
    camelize,
    underscoped,
    classify,
    swapCase,
    capitialize,
    sentence,
    titleize,
    padStartString,
    padStartString as padStart,
    padEndString,
    padEndString as padEnd
}