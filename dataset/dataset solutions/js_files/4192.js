'use strict'

function main(input) {
    const sum = input
        .split('')
        .map(v => ~~v)
        .reduce((a, b) => a + b)
    const ans = Number(input) % sum === 0 ? 'Yes' : 'No'
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
