// stream-io-process
export function getProcessStdin() {
    // pass process stdin to some pipe
    // return process.stdin.pipe(outStream);
    return process.stdin
}

export function getProcessStdout() {
    return process.stdout
}