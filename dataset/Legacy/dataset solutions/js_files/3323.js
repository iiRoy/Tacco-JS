'use strict'

function solve(N, P) {
  var dp = new Array(N+1).fill(0).map(e => new Array(N+1).fill(0))
  for (var i = 0; i < dp.length; i++) {
    for (var j = 0; j < dp[i].length; j++) {
      if (i === 0 && j === 0) {
        dp[i][j] = 1
        continue
      }
      if (j > i) {
        dp[i][j] = 0
      } else if (j === i) {
        dp[i][j] = P[i-1] * dp[i-1][j-1]
      } else if (j < i) {
        if (j === 0) {
          dp[i][j] = (1-P[i-1]) * dp[i-1][j]
        } else {
          dp[i][j] = P[i-1] * dp[i-1][j-1] + (1-P[i-1]) * dp[i-1][j]
        }
      }
    }
  }
  var startIndex = parseInt(N/2) + 1
  var res = 0
  for (var i = startIndex; i < dp[N].length; i++) {
    res += dp[N][i]
  }
  return res
}

function main(input) {
  var lines = input.split("\n")
  var N = parseInt(lines[0])
  var P = lines[1].split(' ').map(l => parseFloat(l))
  var ans = solve(N, P)
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));