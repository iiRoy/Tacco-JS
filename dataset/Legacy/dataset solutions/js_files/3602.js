'use strict'

const main = (input) => {
    input = input.split(' ').map(i => parseInt(i))
    const A = input[0]
    const B = input[1]
    console.log((A - 1) * (B - 1))
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))