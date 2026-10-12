'use strict'

function main(input) {
    input = input.split('\n')
    input[0] = input[0].split(' ').map(v => ~~v)
    input[1] = ~~input[1]
    input[0] = input[0].sort((a, b) => a - b)

    let n = input[0].length - 1
    input[0][n] = input[0][n] * (2 * input[1])
    let ans = input[0].reduce((a, b) => a + b)


    console.log(ans)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));