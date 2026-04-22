'use strict'

const main = (input) => {
    const n = parseInt(input)
    let p = 1
    for(let i = 1; i <= n; i++){
        p *= i 
        p %= Math.pow(10, 9) + 7 
    }
    console.log(p)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))