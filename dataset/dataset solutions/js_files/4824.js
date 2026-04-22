'use strict'

const main = (input) => {
    input = input.split('\n')
    const h = parseInt(input[0].split(' ')[0])
    const arr = input.slice(1, h + 1)

    arr.forEach(v => {
        console.log(v)
        console.log(v)
    })
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))