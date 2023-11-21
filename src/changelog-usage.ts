
export function usage() {
    let res: string = ''
    res = `
-h,--help boolean                    info help usage (default:'false')
-v,--version boolean                 info app version (default:'1.0.0')
--log-info boolean                   set true to log [info] msg (default:'false')
--log-task boolean                   set true to log [task] msg (default:'false')
--commitlog-loc string               set the location of commitlog file (default:'commitlog.tmp.json') 
--commitlog-sort-date boolean        sort commitlog with date (default:'true') 
--ignore-types string                ignore this types (default:'chore,tool,docs,style') 
--ignore-subjects string             ignore this subjects (default:'put changelog,dbg markdown list') 
--mono-repo boolean                  this repo is mono repo (default:'false') 
--changelog-loc string               set the location of changelog file (default:'CHANGELOG.md')
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
--commitpkg-loc string               set the location of commitpkg file (default:'cmtedpkgs.tmp.json')
--commitpkg-filter-order string      commitpkg filter order (default:'pkg-pick,pick-omit')
--pick-pkg string                    commitpkg filter with pkg pick (default:'')
--omit-pkg string                    commitpkg filter with pkg omit (default:'')
                                     
--packages-loc-reg RegExp            the regexp of packages location (default:'')
`
    return res
}
