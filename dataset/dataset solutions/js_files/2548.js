"use strict"

const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const arg = arg_str.split('\n')
const arg_1 = arg[0].split(' ')
const P_array = arg[1].split(' ')

const N = parseInt(arg_1[0])
const K = parseInt(arg_1[1])

let result = []
let count = 0

const p = new Array(P_array.length - K + 1).fill(0)
p.map(function(num, index) {
     if(index + K > P_array.length) return

  const a_1 = P_array.slice(0, index)
    const a_2 = P_array.slice(index, index + K).sort((a,b)=>a>b)
    const a_3 = P_array.slice(index + K)
    const P = a_1.concat(a_2).concat(a_3)
    const P_str = P.join('')

    if(result.indexOf(P_str) < 0){
        result.push(P_str)
    }
    count++
});

console.log(Object.keys(result).length)