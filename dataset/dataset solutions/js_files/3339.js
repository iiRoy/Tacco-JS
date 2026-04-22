'use strict'

const mod = 1e9 + 7

function solve(N, K, A) {
  if (K === 0) {
    return 1
  }
  var dp = new Array(K+1).fill(0)
  var prefix = new Array(N).fill(0).map(e => new Array(K+1).fill(0))

  for (var i = 0; i < N; i++) {
    for (var j = 0; j <= K; j++) {
      if (i === 0) {
        dp[j] = j <= A[i] ? 1 : 0
        prefix[i][j] = j > 0 ? ((prefix[i][j-1] + dp[j]) % mod) : (dp[j] % mod)
      } else {
        dp[j] = (j-1 - A[i]) >= 0 ? ((prefix[i-1][j] - prefix[i-1][j - A[i] - 1]) % mod) : (prefix[i-1][j] % mod)
        prefix[i][j] = j > 0 ? ((prefix[i][j-1] + dp[j]) % mod) : (dp[j] % mod)
      }
    }
  }
  return dp[K] % mod
}

function main(input) {
  var lines = input.split("\n")
  var NK = lines[0].split(' ').map(l => parseInt(l))
  var N = NK[0]
  var K = NK[1]
  var A = lines[1].split(' ').map(l => parseInt(l))
  var ans = solve(N, K, A)
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));