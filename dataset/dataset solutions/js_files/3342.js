'use strict'

function sumCalc(f, t, prefix) {
  if (f === 0) {
    return prefix[t]
  }
  return prefix[t] - prefix[f-1]
}

function getPrefixSum(A) {
  var prefix = new Array(A.length)
  prefix[0] = A[0]
  for (var i = 1; i < A.length; i++) {
    prefix[i] = prefix[i-1] + A[i]
  }
  return prefix
}

function solve(N, A) {
  var dp = new Array(N).fill(0).map(e => new Array(N).fill(0))
  var prefix = getPrefixSum(A)
  var col = 1
  while (col < N) {
    var c = col
    for (var r = 0; r < N; r++) {
      if (c === N) {
        break
      }
      dp[r][c] = Number.MAX_SAFE_INTEGER
      for (var k = r; k < c; k++) {
        dp[r][c] = Math.min(dp[r][c], dp[r][k] + dp[k+1][c] + sumCalc(r, k, prefix) + sumCalc(k+1, c, prefix))
      }
      c++
    }
    col++
  }
  return dp[0][N-1]
}

function main(input) {
  var lines = input.split("\n")
  var N = parseInt(lines[0])
  var A = lines[1].split(' ').map(l => parseInt(l))
  var ans = solve(N, A)
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));