
export interface CliParam {
    name: string, type: string, value: string | boolean | number, desc: string
}

/**
 * ysc param preset - base - for help and version
 */
export function baseParam(): CliParam[] {
    return [
        {
            name: '-h,--help',
            type: 'boolean',
            value: false,
            desc: 'info help'
        },
        {
            name: '-v,--version',
            type: 'string',
            value: '1.0.0',
            desc: 'info version'
        }
    ]
}
/**
 * ysc param preset - token - for github
 */
export function tokenParam(): CliParam[] {
    return [
        {
            name: '--token',
            type: 'string',
            value: '',
            desc: 'the github token'
        },
        {
            name: '--token-file-loc',
            type: 'string',
            value: 'secrets/token-for-dev.txt',
            desc: 'the github token file loc'
        }
    ]
}
/**
 * ysc param preset - page - for github
 */
export function pageParam(): CliParam[] {
    return [
        {
            name: '-p,--page',
            type: 'number',
            value: 1,
            desc: 'number of the results to fetch'
        },
        {
            name: '--per-page',
            type: 'number',
            value: 30,
            desc: 'number of results per page (max 100)'
        }
    ]
}
/**
 * ysc param preset - user - for github
 */
export function userParam(): CliParam[] {
    return [
        {
            name: '--username',
            type: 'string',
            value: 'ymc-github',
            desc: 'the handle for the gitHub user account'
        }
    ]
}

export function githubParam(): CliParam[] {
    return [...baseParam(), ...tokenParam(), ...pageParam(), ...userParam()]
}