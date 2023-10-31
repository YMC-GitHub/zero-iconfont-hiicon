/**
 * read data as string from a readable stream 
 * @sample
 * ```
 * // stream -> ''
 * readStream()
 * ```
 */
export function readStreamAsString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
        // 
        let data = ''
        stream
            .on('data', (chunk: Buffer | string) => {
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
 * @sample
 * ```
 * // uc 1 - 
 * let data:string |underdefine = 'hello zero!'
 * let writer = getOutToFsLocation(file.name)
 * await writeStringToStream(writer, data)
 * 
 * 
 * await writeStringToStream(writer)
 * ```
 */
export function writeStringToStream(stream: any, data?: string) {
    return new Promise((resolve, reject) => {
        //1. write data when passed data and fire end
        if (data !== undefined) {
            // write
            stream.write(data, 'utf-8')
            // fire end
            stream.end()
        }

        // desc-x-s: handle event finish and err
        stream
            .on('finish', () => {
                // resolve the recieve data
                resolve(data)
            })
            .on('error', reject)
        // desc-x-e: handle event finish and err
    })
}