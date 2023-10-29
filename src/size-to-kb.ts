export type SizeUnit = 'b'|'kb'|'mb'|'gb'
export function size2kb(size:number,unit:SizeUnit='kb',fixed:number=2){
    let num
    switch (unit) {
        case 'kb':
            num= (size/1024)
            break;
        case 'mb':
            num= (size/1024/1024)
            break;
        case 'gb':
            num= (size/1024/1024/1024)
            break;
        default:
            num= size
            break;
    }
    num=num.toFixed(fixed)
    return [num,unit].join('')
}
