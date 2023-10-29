// import { Writable,Readable,Duplex,Transform } from 'stream'
import {createReadStream,createWriteStream,statSync,existsSync,mkdirSync} from "fs"
import {dirname,resolve} from "path"

// import {createGzip} from 'zlib'
// import { ReadStream } from 'tty'

export type PlainObject = Record<string,any>
export class JsonStreamIo {
    file:PlainObject={};
    option:PlainObject={};
    constructor(name?:string, data?:any) {
        this.init(name, data)
    }

    /**
     * read file async (stream mode)
     */
    async read(def = {}) {
        const { file } = this
        let reader
        let res
        try {
            reader = getInFromFsLocation(file.name)
            res = await readStream(reader)
            res = JSON.parse(res)
        } catch (error) {
            // console.log(error);
            res = def
        }
        file.data = res
        return res
    }

    /**
     * write file async (stream mode)
     */
    async write(data:any) {
        // no-param-reassign data
        // no-unused-vars option
        /* eslint-disable no-unused-vars */
        const { file, option } = this // eslint-disable-line
        let writer
        let content = data
        try {
            writer = getOutToFsLocation(file.name)
            if (data) {
                file.data = data
            } else {
                content = file.data
            }
            await writeStream(writer,JSON.stringify(content, null, 2))
        } catch (error) {
            // do nothing
            /* eslint-disable no-unused-vars */
            ;(v => {})(error)
        }
    }

    init(name:string = 'package.json', data:any = {}) {
        this.file = {name,data}
        this.option = {}
    }

    /* eslint-disable class-methods-use-this */
    /**
     * make a new instance
     */
    // @ts-ignore
    new(...option) {
        // @ts-ignore
        return new JsonStreamIo(...option)
    }
}

export const jsonStreamIo = new JsonStreamIo()
// stream-io
// export function getProcessStdin(){
//     // pass process stdin to some pipe
//     // return process.stdin.pipe(outStream);
//     return  process.stdin
// }

// export function getProcessStdout(){
//     return process.stdout
// }


export function getInFromFsLocation(location:string){
    return createReadStream(location)
}

export function getOutToFsLocation(location:string){
    makedirs(location)
    return  createWriteStream(location)
}

// keywords: dirs-io,mkdir
export function makedirs(loc:string){
    let dir = dirname(resolve(loc))
    if(!existsSync(dir)) mkdirSync(dir,{recursive:true})
}



/**
 * read data as string from a readable stream 
 * @sample
 * ```
 * // stream -> ''
 * readStream()
 * ```
 */
export function readStream(stream:any):Promise<string> {
    return new Promise((resolve, reject) => {
        // 
        let data = ''
        stream
            .on('data', (chunk:Buffer|string) => {
                // log chunk size and chunk to string
                // console.log(`Read ${chunk.length} bytes\n"${chunk.toString()}"\n`);
                data += chunk.toString()
            })
            .on('end', () => {
                resolve(data)
            })
            .on('error', reject)
    })

    // function chunk2string(buf:Buffer){
    //     return buf.toString()
    // }
}


/**
 * 
 * write string data to a ws
 */
export function writeStream(stream:any,data:string) {
    return new Promise((resolve, reject) => {
        // write
        stream.write(data, 'utf-8')
        // fire end
        stream.end()
        // desc-x-s: handle event finish and err
        stream
            .on('finish', () => {
                resolve(data)
            })
            .on('error', reject)
        // desc-x-e: handle event finish and err
    })
}