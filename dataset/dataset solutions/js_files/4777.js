'use strict'

const main = (input) => {
    const K = parseInt(input.split(' ')[0])
    const S = parseInt(input.split(' ')[1])

    let sum = 0
    for(let x = 0; x <= K; x++){
        for(let y = 0; y <= K; y++){
            for(let z = 0; z <= K; z++){
                if(x + y + z === S){
                    sum++
                }
            }
        }
    }
    console.log(sum)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))