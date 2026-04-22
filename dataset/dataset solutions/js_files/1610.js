function Main(input) {
  input = input.trim().split("\n");
  const [R, C, n] = input.shift().split(" ").map((a) => parseInt(a, 10));
  const values = input.map((a) => a.split(" ").map((b) => parseInt(b, 10)));

  a = [];
  dp = [];
  for (let i=0; i<3005; i++) {
    const array = [];
    for (let j=0; j<3005; j++) {
      array.push(new Array(4));
    }
    dp.push(array);
  }

  for (let i=0; i<n; i++) {
    const [r, c, v] = values[i];
    a[r - 1] = a[r - 1] || [];
    a[r - 1][c - 1] = v;
  }

  for (i=0; i<R; i++) {
    for (let j=0; j<C; j++) {
      for (let k = 2; k >= 0; k--) {
        dp[i][j][k+1] = Math.max(dp[i][j][k+1] || 0, (dp[i][j][k] || 0)  + (a[i][j] || 0));
      }
      for (k = 0; k<4; k++) {
        dp[i+1][j][0] = Math.max(dp[i+1][j][0] || 0, dp[i][j][k] || 0);
        dp[i][j+1][k] = Math.max(dp[i][j+1][k] || 0, dp[i][j][k] || 0)
      }
    }
  }

  let ans = 0;
  for (k = 0; k<4; k++) {
    ans = Math.max(ans, dp[R-1][C-1][k]);
  }
  console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
