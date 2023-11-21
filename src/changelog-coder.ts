import { beautyUsage, usage2param, pickUsage } from "./cli-param-plugin-usage"
import { readTextFileSync, writeTextFileSync, writeJsonFileSync } from "./editjson"
import { paramPluginTsdoc } from "./cli-param-plugin-tsdoc"
import { camelize, classify } from "./string"

const { log } = console
export function usage() {
    let res: string = ''
    // feat(core): code in src/xx-coder.ts
    res = `
-h,--help boolean info help usage  (default:'false')
-v,--version boolean info app version  (default:'1.0.0')
--log-info boolean             set true to log [info] msg (default:'false')
--log-task boolean             set true to log [task] msg (default:'false')
--commitlog-loc string set the location of commitlog file (default:'commitlog.tmp.json') 

--packages-loc-reg regexp      the regexp of packages location (default:'')
--out string                   the file path of output (default:'pkgs-cmted.tmp.json')
--ignore-types string          the types to ignore (default:'docs,chore,tool,style')
--ignore-subjects string       the subjects to ignore (default:'')
--only-pkgs string             filter pkgs with the packages loc  (default:'')

`

    let mode: '' | 'code-usage-in-file' | 'code-usage-in-js' = 'code-usage-in-file'
    // feat(core): load usage when local file exsit
    // feat(core): code in usages/xx.md
    res = readTextFileSync(`usages/changelog.md`, res)
    // feat(core): load usage from remote uri if it exsit when no local file (todo)

    res = res.trim().replace(/ +/ig, ' ')
    res = beautyUsage(res, { type: true, prefixLength: 0 })


    genPreset(`changelog`, res)
    genPreset(`commitlog-filter`, pickUsage(res, '*commitlog filter*'))
    return res
}


function genPreset(name: string, text: string,) {
    log(`[info] gen ${name}: `)

    // feat(core): write changelog usage to local file
    writeTextFileSync(`usages/${name}.md`, text)
    // todo: let vite,tsx load usage file to module


    writeTextFileSync(`src/${name}-usage.ts`, codeUsageFunctionText(text))
    // const { log } = console
    let param = usage2param(text, { type: true })
    // feat(core): write changelog param to local file
    writeJsonFileSync(`src/${name}-param.json`, param)

    // feat(core): write changelog tsdoc to local file
    writeJsonFileSync(`src/${name}-types.ts`, paramPluginTsdoc(param, `${classify(name)}Option`, { export: true }))
}

function codeUsageFunctionText(text: string) {
    let res: string = `
export function usage() {
    let res: string = ''
    res = \`
${text}
\`
    return res
}
`
    return res
}

usage()
// tsx src/changelog-coder.ts