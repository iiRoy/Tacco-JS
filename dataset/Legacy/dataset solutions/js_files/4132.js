'use strict'

function main(input) {

    input = input.split(/\n|\s/).map(v => ~~v)
    const sum = input[0] + input[1] - (input[2] + input[3])

    let ans = 'Balanced'

    if (sum > 0) {
        ans = 'Left'
    } else if (sum < 0) {
        ans = 'Right'
    }
    console.log(ans)

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));