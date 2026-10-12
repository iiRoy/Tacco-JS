'use strict'

function Main(input) {
  input = input.trim().split('\n')
  const a = input[0].split(' ').map(s => parseInt(s))
  const N = a[0]
  const K = a[1]
  const rest = input[1].split(' ').map(s => parseInt(s))
  const R = rest[0]
  const S = rest[1]
  const P = rest[2]
  const T = input[2]

  var dp = []

  for(var i = 0; i < N; ++i){
    let ans = T[i]

    // K個前の特典が有効であれば、contineする
    if(i >= K && T[i - K] === ans && dp[i - K] > 0) {
      dp.push(0)
      continue
    }


    if (ans === 'r') {
      dp.push(P)
    } 

    if(ans === 's') {
      dp.push(R)
    }

    if(ans === 'p') {
      dp.push(S)
    }    
  }
  console.log(dp.reduce((p, c) => p + c))
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));