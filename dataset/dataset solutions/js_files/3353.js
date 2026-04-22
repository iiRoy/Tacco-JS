'use strict'

function solve(N, H, A) {
  var dp = new Array(N).fill(0).map((e, index) => A[index])
  var maxBeauty = 0
  for (var i = 0; i < N; i++) {
    var beauty = 0
    for (var j = 0; j < i; j++) {
      if (H[i] > H[j] && beauty < dp[j]) {
        beauty = dp[j]
      }
    }
    dp[i] += beauty
    if (dp[i] > maxBeauty) {
      maxBeauty = dp[i]
    }
  }
  return maxBeauty
}

function main(input) {
  var lines = input.split("\n")
  var N = parseInt(lines[0])
  var H = lines[1].split(' ').map(l => parseInt(l))
  var A = lines[2].split(' ').map(l => parseInt(l))
  var ans = solve(N, H, A)
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
