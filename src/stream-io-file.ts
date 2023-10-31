
// import { Writable,Readable,Duplex,Transform } from 'stream'
import { createReadStream, createWriteStream, statSync, existsSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"
// import {createGzip} from 'zlib'
// import { ReadStream } from 'tty'

// export type PlainObject = Record<string, any>

// stream-io-file
export function getInFromFsLocation(location: string) {
    return createReadStream(location)
}

export function getOutToFsLocation(location: string) {
    makedirs(location)
    return createWriteStream(location)
}

// keywords: dirs-io,mkdir
export function makedirs(loc: string) {
    let dir = dirname(resolve(loc))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}
