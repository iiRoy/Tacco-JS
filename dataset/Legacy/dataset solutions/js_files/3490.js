'use strict'

const main = (input) => {
    input = input.split('\n')
    let temp = input[0].split(' ').map(i => parseInt(i))
    const N = temp[0]
    const T = temp[1]
    temp = input.slice(1, N + 1)
    let ans = 1001
    temp.forEach(t => {
        let tmp = t.split(' ').map(i => parseInt(i))
        let c = tmp[0]
        let time = tmp[1]
        if(time < T && c < ans){
            ans = c
        }
    })

    if(ans === 1001){
        console.log('TLE')
    }else{
        console.log(ans)
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))