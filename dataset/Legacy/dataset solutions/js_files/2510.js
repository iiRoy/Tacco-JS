"use strict"

const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const arg = arg_str.split('\n')
const S = arg[0]
const K = parseInt(arg[1])

let T = S.split('')

let result = 0

let T_only_1_type = true
let T_temp = ''
for(let i=1;i<=T.length;i++){
  if(T_temp == T[i]){
  }else if(T_temp){
    T_only_1_type = false
    break
  }else{
    T_temp = T[i]
  }
}

if(!T_only_1_type){
  for(let i=1;i<=T.length;i++){
      let a = T[i-1]
      let b = T[i]
      if(a == b){
          T[i] = 'X'
          result++
      }
  }
}

result *= K

if(T[0] == T[T.length-1] && T_only_1_type){
  const TK = T.length * K
  result += TK % 2 == 0 ? TK / 2 : (TK - 1) / 2
}else if(T[0] == T[T.length-1]){
  result += K -1
}

console.log(result)