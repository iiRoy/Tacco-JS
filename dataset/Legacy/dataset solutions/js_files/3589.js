'use strict'

const main = (input) => {
    input = input.split('\n')
    const N = parseInt(input[0].split(' ')[0])
    const K = parseInt(input[0].split(' ')[1])
    const arr = input[1].split(' ').map(v => parseInt(v))

    let dist = 100000000000
    // 通るべき点を調べ上げる
    for(let i = 0; i <= arr.length - K; i++){
        let points = arr.slice(i, K + i)
        // 左端からスタートするときの距離
        let sleft = Math.abs(points[0]) + Math.abs(points[0] - points[points.length - 1])
        if(dist > sleft){
            dist = sleft
        }
        // 右端からスタートするときの距離
        let sright = Math.abs(points[points.length - 1]) + Math.abs(points[points.length - 1] - points[0])
        if(dist > sright){
            dist = sright
        }
    }
    console.log(dist)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))