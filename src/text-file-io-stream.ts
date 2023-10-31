import { getInFromFsLocation, getOutToFsLocation } from "./stream-io-file"
import { readStreamAsString, writeStringToStream } from "./stream-tf-text"

export interface TextFile {
    name: string,
    data: string
}
type TextFileLike = Partial<TextFile>
const builtinTextFile = { name: '', data: '' }
export type DataWritenMode = 'override' | 'append' | 'head' | 'unknow' | ''

function updateText(current: string, recive: string, mode: string) {
    let text: string
    switch (mode) {
        case 'override':
            text = `${recive}`
            break
        case 'append':
            text = `${current}\n${recive}`
            break
        case 'head':
            text = `${recive}\n${current}`
            break
        default:
            text = `${recive}`
            break
    }
    return text
}


// interface FileIoOption {
//     name: string,
//     data: string
// }
// type FileIoOptionLike = Partial<FileIoOption>
// const builtinFileIoOption = { name: '', data: '' }

/**
 * @sample
 * ```
 * textFileIoStream.file.name="CHANGELO.md"
 * //or
 * textFileIoStream.init("CHANGELO.md")
 * await textFileIoStream.read()
 * textFileIoStream.option.writemode='overide'
 * await textFileIoStream.write('')
 * ```
 */
export class TextFileIoStream {
    file: TextFile = builtinTextFile
    option: { writemode: DataWritenMode } = { writemode: '' };

    constructor(name?: string) {
        this.init(name)
    }

    async read(def: string = '') {
        const { file } = this
        let reader
        let res
        try {
            reader = getInFromFsLocation(file.name)
            res = await readStreamAsString(reader)
        } catch (error) {
            res = def
        }
        file.data = res
        return res
    }

    /**
     * write file async (stream mode)
     * @param {string} data
     * @returns {Prmosie<void>}
     */
    async write(data: string) {
        const { file, option } = this
        let writer
        let old

        writer = getOutToFsLocation(file.name)
        old = file.data
        // insert-head?append?override?
        // let writemode = "override";
        let text = updateText(old, data, option.writemode)
        // update cache
        file.data = text
        // write to file
        return await writeStringToStream(writer, data)
    }

    /**
     *
     * @param {string} name
     * @param {string} data
     * @returns {this}
     */
    init(name = 'README.md', data = '') {
        this.file = {
            name,
            data
        }
        this.option = { writemode: '' }
        return this
    }

    /**
     * ceate a new instance
     */
    new(...option: any[]) {
        return new TextFileIoStream(...option)
    }
}