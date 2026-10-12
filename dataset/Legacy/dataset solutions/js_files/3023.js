"use strict";

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0], 10);
  var A = [];

  for (var i = 0; i < N; i++) {
    A.push(parseInt(input[i + 1], 10));
  }

  var S = A.reduce(function (p, c) {
    return p + c;
  }); // R, Gにしないパターン

  var dp = new Array(N + 1); // R, G, Bにするパターン

  var dp1 = new Array(N + 1);

  for (var _i = 0; _i <= N; _i++) {
    dp[_i] = new Array(S + 1).fill(0);
    dp1[_i] = new Array(S + 1).fill(0);
  }

  dp[0][0] = 1;
  dp1[0][0] = 1;

  for (var _i2 = 0; _i2 <= N; _i2++) {
    for (var j = 0; j <= S; j++) {
      var diff = j - A[_i2 - 1];

      if (_i2 > 0 && diff >= 0) {
        // Rにするパターン
        dp[_i2][j] += dp[_i2 - 1][diff];
        dp1[_i2][j] += dp1[_i2 - 1][diff];
      }

      if (_i2 > 0) {
        // Gにするパターン
        dp[_i2][j] += dp[_i2 - 1][j]; // G or Bにするパターン

        dp1[_i2][j] += 2 * dp1[_i2 - 1][j];
      }
    }
  }

  var total = Math.pow(3, N);
  var sum = 0;
  var sum1 = 0;

  for (var _i3 = parseInt(S / 2, 10); _i3 <= S; _i3++) {
    if (_i3 >= S / 2) {
      sum += dp1[N][_i3];
    }

    if (_i3 === S / 2) {
      sum1 += dp[N][_i3];
    }
  }

  console.log((total - 3 * sum + 3 * sum1) % 998244353);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));