// topic: factorial,number-enhance,
// tail recursive function
// recursive function
// for loop
// while loop
// do-while loop

// arguments.callee

// complexity O(1)

// function facWithTailRecursiveFunc(num: number): number {
//     // let res: number = 1
//     if (num === 1) {
//         return 1;
//     } else if (num === 0) {
//         return 1;
//     } else {
//         // res = num * factorial(num - 1)
//         // return res

//         // tail recursion
//         return num * facWithTailRecursiveFunc(num - 1)
//     }
// }

/**
 * 
 * @sample
 * ```
 * facWithForLoop(10)
 * //
 * //for loop
 * ```
 */
export function facWithForLoop(num: number | string) {
    let res: number = typeof num === 'string' ? Number(num) : num
    for (let i = res - 1; i >= 1; i--) {
        res *= i;
    }
    return res;
}

/**
 * 
 * @sample
 * ```
 * facWithWhileLopp(10)
 * //
 * //while loop
 * ```
 */
export function facWithWhileLopp(num: number) {
    let input: number = typeof num === 'string' ? Number(num) : num
    let res: number = input
    while (input > 1) {
        input--;
        res *= input;
    }
    return res;
}


/**
 * 
 * @sample
 * ```
 * fac(10)
 * //
 * //tail recursive function
 * ```
 */
export function fac(num: number | string): number {
    let input: number = typeof num === 'string' ? Number(num) : num
    if (input <= 1) {
        return 1;
    } else {
        return input * fac(--input);
        // Arguments.callee cannot be accessed via scripts in strict mode
        // return num*arguments.callee(num-1)
    }
}
