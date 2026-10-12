'use strict'
function Main(input) {
  input = input.split("\n")
  let line1 = input[0].split(' ')
  let N = parseInt(line1[0])
  let K = parseInt(line1[1])
  let A = input[1].split(' ')
  let ret = 0
  let minPos = -1
  for (let i = 0; i < N; i += 1) {
    if (minPos === -1 || A[minPos] > A[i]) minPos = i
  }
  console.log(Math.floor((N - 1 + K - 2) / (K - 1)))
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"))