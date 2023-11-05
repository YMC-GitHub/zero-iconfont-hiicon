export function param() {
    let res: any = [
        // ...baseParam(),
        {
            name: '--packages-loc-reg',
            type: 'regexp',
            value: '*',
            desc: 'the regexp of packages location'
        },
        {
            name: '--out',
            type: 'string',
            value: 'pkgs-cmted.tmp.json',
            desc: 'the file path of output'
        },
        {
            name: '--ignore-types',
            type: 'string',
            value: 'docs,chore,tool,style',
            desc: 'the types to ignore'
        },
        {
            name: '--ignore-subjects',
            type: 'string',
            value: '',
            desc: 'the subjects to ignore'
        },
        {
            name: '--only-pkgs',
            type: 'string',
            value: '',
            desc: 'filter pkgs with the packages loc '
        },
        {
            name: '--log-info',
            type: 'boolean',
            value: 'false',
            desc: 'set true to log [info] msg'
        },
        {
            name: '--log-task',
            type: 'boolean',
            value: 'false',
            desc: 'set true to log [task] msg'
        }
    ]
    return res
}
// todo: param to types

// todo: param to builtin option

// todo: param to usage