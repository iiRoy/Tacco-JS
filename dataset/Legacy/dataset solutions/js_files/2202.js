'use strict'

function Main(input) {
  input = input.trim().split('\n')
  const array = input[0].split(' ').map(s => parseInt(s))
  const rest = input.slice(1)
  const H = array[0]
  const N = array[1]

  const A = []
  for(let i = 0; i < rest.length; ++i) {
    const a = rest[i].split(' ').map(s => parseInt(s))
    A.push({value: a[0], mp: a[1]})
  }

  let dp = Array(9999).fill(0)

  for(let i = 0; i < N; ++i) {
    for(let j = A[i].value; j <= H; ++j) {
      if (dp[j] !== 0) {
        dp[j] = Math.min(dp[j], dp[j - A[i].value] + A[i].mp)
      } else {
        dp[j] = dp[j - A[i].value] + A[i].mp
      }
      
    }
  }



  console.log(dp[H])
  
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
