// touch -- mock bash cmd touch

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'fs'
import { dirname, resolve, join } from 'path'
const { log } = console

export function saveTextFile(loc: string, text = '') {
    makedirs(loc)
    log(`[info] out: ${loc}`)
    writeFileSync(loc, text)
}
export function makedirs(loc: string) {
    let dir = dirname(resolve(loc))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export function touch(loc: string, text: string = '') {
    // do not anything when exist loc
    if (existsSync(loc)) return false

    makedirs(loc)
    // add an empty text file
    saveTextFile(loc, text)
    return true
}