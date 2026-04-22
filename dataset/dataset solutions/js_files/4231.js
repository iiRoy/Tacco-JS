'use strict'

// const conv = (str) => {
//     if(str === 'A') return 10
//     if(str === 'B') return 11
//     if(str === 'C') return 12
//     if(str === 'D') return 13
//     if(str === 'E') return 14
//     if(str === 'F') return 15
// }

const main = (input) => {
    let X = input.split('\n')[0].split(' ')[0]
    let Y = input.split('\n')[0].split(' ')[1]
    if(X === Y){
        console.log('=')
    }else if(X > Y){
        console.log('>')
    }else{
        console.log('<')
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))