'use strict'

function Main(input) {

  input = input.trim().split(' ')

  const a = parseInt(input[0])
  const b = parseInt(input[1])

  let res = ''
  if (a < b) {
    for(let i = 0; i < b; ++i) {
      res += `${a}`
    }
  } else {
    for(let i = 0; i < a; ++i) {
      res += `${b}`
    } 
  }

  console.log(res)


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));