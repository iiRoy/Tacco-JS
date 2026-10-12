'use strict'

const main = (input) => {
    const x = parseInt(input)
    if(x < 1200){
        console.log('ABC')
    }else{
        console.log('ARC')
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))