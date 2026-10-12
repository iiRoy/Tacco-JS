'use strict'

const main = (input) => {
    input = input.split('\n').map(v => v.split(''))
    const a = input[0]
    const b = input[1]
    const c = input[2]

    let i = 'a'
    let item = []
    while(true){
        if(i === 'a'){
            item = a
        }else if(i === 'b'){
            item = b
        }else{
            item = c
        }
        if(item.length === 0){
            console.log(i.toUpperCase())
            break
        }
        i = item.shift()
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))