'use strict'

const main = (input) => {
    input = input.split(' ').map(i => parseInt(i))
    const A = input[0]
    const B = input[1]
    const K = input[2]

    let arr = []
    for(let i = A; i <= B; i++){
        arr.push(i)
    }
    const first = arr.slice(0, K)
    const last = arr.slice(-K)
    const ans = new Set([...first, ...last])
    ans.forEach(v => console.log(v))
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))