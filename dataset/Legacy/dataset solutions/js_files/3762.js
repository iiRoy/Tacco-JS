'use strict'

function main(input) {

    var input = `999`
    input = Number(input)

    let ans = (input > 1000) ? 'c' : 'd'
    console.log('ab' + ans)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));