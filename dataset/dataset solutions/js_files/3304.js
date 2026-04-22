var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8')
var rows = inputRaw.trim().split('\n');
var row1 = rows[0].split(' ').map(Number);
var N = row1[0];
var W = row1[1];
var list = rows.slice(1).map(r => r.split(' ').map(Number));
var dp = Array.from({ length: N + 1 }, _ => Array(W + 1).fill(0));

function solve() {

  for (var i = 0; i < N; i++) {
    for (var j = 0; j <= W; j++) {
      if (list[i][0] <= j) {
        var a = dp[i][j - list[i][0]] + list[i][1];
        var b = dp[i][j];
        dp[i + 1][j] = Math.max(a, b);
      } else {
        dp[i + 1][j] = dp[i][j];
      }
    }
  }
  return dp[N][W];
}

console.log(solve());
