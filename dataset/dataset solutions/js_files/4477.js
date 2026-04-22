'use strict'
function Main(input) {
    input = input.split("\n");
    const n = parseInt(input[0], 10)
    const arr = input[1].split(' ').map(v => parseInt(v, 10))
    const sum = arr.reduce((pre, cur) => pre + cur)
    let min = -1
    let tmp = 0
    for (let i = 0; i < n - 1; i ++) {
        tmp += arr[i]
        const abs = Math.abs(sum - 2 * tmp)
        if (min < 0 || min > abs) {
            min = abs
        }
    }
    console.log(min)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));