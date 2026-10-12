'use strict'

function Main(input) {
  input = input.trim().split('\n')
  const N = parseInt(input[0])
  let X = input[1].split(' ').map(s => parseInt(s))

  X = X.sort()

  const MAX = 100

  const memo = {}
  for(let i = 0; i <= MAX; ++i) {
    memo[i] = false
    for(let j = 0; j < N; ++j) {
      if (i === X[j]) memo[i] = true
    }

  }

  let result = Infinity

  for(let i = 1; i <= MAX; ++i) {
    if(!memo[i]) {
      let total = 0
      for(let j = 0; j < N; ++j) {
        const n = X[j] - i
        total += n * n
      }

      result = Math.min(result, total)

    }
  }


  console.log(result)


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));