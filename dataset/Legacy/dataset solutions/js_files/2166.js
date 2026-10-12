'use strict'


function Main(input) {
  input = input.trim().split('\n')
  const [S, T] = input[0].split(' ')
  const res = input[1].split(' ').map(s => parseInt(s))

  let A = res[0]
  let B = res[1]

  const U = input[2]

  if (U === S) {
    A -= 1
  } else {
    B -= 1
  }

  console.log(`${A} ${B}`)



}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));