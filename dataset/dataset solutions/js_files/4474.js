'use strict'

const main = (input) => {
    input = input.split('\n')
    const N = parseInt(input[0].split(' ')[0])
    const K = parseInt(input[0].split(' ')[1])
    const ls = input[1].split(' ').map(v => parseInt(v)).sort((a, b) => b - a)

    let sum = 0
    for(let i = 0; i < K; i++){
        sum += ls[i]
    }
    console.log(sum)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))