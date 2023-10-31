
import { writeTpl, renderTpl } from './text-plain-template'
import type { PlainObject } from './text-plain-template'
import type { Commitlog } from './commitlog'

export interface ChangelogStyleOption {
    style: string
}
export type ChangelogStylePluginFunction = (s: ChangelogStyle) => string
export interface StylePluginOject {
    name: string,
    render: ChangelogStylePluginFunction
}
export type StylePluginArray = [
    name: string,
    render: ChangelogStylePluginFunction
]

/**
 * @sample
 * ```
 * //
 * chaneglog.data=[]
 * changelog.option={}
 * changelog.render()
 * ```
 */
export class ChangelogStyle {
    option: ChangelogStyleOption = { style: '' }
    result: string = ''
    plugin: ChangelogStylePluginFunction[] = []
    // data: Record<string, string>[] = []
    // data: PlainObject[] = []
    data: Commitlog[] = []

    constructor() {
        this.init()
    }

    init() {
        this.option = { style: '' }
        this.data = []
        this.result = ''
        this.plugin = []
        return this
    }

    /**
     * bind write tpl to ctx
     */
    writeTpl(tpl: string, data?: PlainObject) {
        return writeTpl(tpl, data)
    }

    /**
     * redner with option.style or ctx.plugin
     * @returns {string}
     */
    render() {
        const ctx = this

        // render with style and built in plugin
        // const { option } = this
        // switch (option.style.toLowerCase()) {
        //     case 'list':
        //         return ChangelogStylePluginMarkdowntable({})(ctx)
        //     case 'table':
        //         return ChangelogStylePluginList({})(ctx)
        //     default:
        //         break
        // }

        // render with plugin list
        const { plugin } = this
        for (let index = 0; index < plugin.length; index += 1) {
            const fn = plugin[index]
            fn(ctx)
        }
        return this.result
    }
    registerPlugin() {

    }
}
