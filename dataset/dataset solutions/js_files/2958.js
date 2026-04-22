'use strict'

function Main(input) {
  const N = Number(input.split(" ")[0])
  const K = Number(input.split(" ")[1])

  let numerator = 0

  for(let i=1; i<=N; i++) {
    if(i >= K) {
      numerator++
      continue
    }
    let num = i
    let adder = 1
    while(num < K) {
      num *= 2
      adder /= 2
    }
    numerator += adder
  }

  console.log(numerator/N)

}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())
