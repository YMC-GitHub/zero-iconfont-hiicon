
export function usage() {
    let res: string = ''
    res = `
--pick-type string                   commitlog filter with type pick (default:'')
--omit-type string                   commitlog filter with type omit (default:'')
--pick-scope string                  commitlog filter with scope pick (default:'')
--omit-scope string                  commitlog filter with scope omit (default:'')
--pick-subject string                commitlog filter with subject pick (default:'')
--omit-subject string                commitlog filter with subject omit (default:'')
--pick-file string                   commitlog filter with file pick (default:'')
--omit-file string                   commitlog filter with file omit (default:'')
--filter-order string                commitlog filter order (default:'')
--lastest-count number               commitlog filter with file omit (default:'0') 
--since-last-hash boolean            commitlog filter since last hash in changelog.md (default:'false')
`
    return res
}
