'use strict'

const main = (input) => {
    input = input.split('\n').map(v => parseInt(v))
    const N = input[0]
    const K = input[1]
    let current = 1
    for(let i = 1; i <= N; i++){
        let add = Math.min(K, current) 
        current += add
    }
    console.log(current)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))