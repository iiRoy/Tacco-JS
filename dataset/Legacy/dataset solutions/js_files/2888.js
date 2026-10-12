'use strict'

function Main(input) {
  const N = Number(input)
  
  console.log((N - 2) * 180)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())
