"use strict"

const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const args= arg_str.split('\n')
const N = parseInt(args[0])
const a_array = args[1].split(' ').map(x=>parseInt(x))

for(let i=N;i>=1;i--){
  for(let j=N;j>=1;j--){
    if(i >= j) continue
    if(j % i == 0){
      a_array[i-1] ^= a_array[j-1]
    }
  }
}
const result = a_array.filter(x=>x==1)

console.log(result.length)
if(result.length > 0){
  console.log(result.join(' '))
}
