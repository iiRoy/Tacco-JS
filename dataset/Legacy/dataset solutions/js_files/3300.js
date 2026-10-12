function Main(input) {
  input = input.split("\n");
  const N = parseInt(input[0],10);
  const changeInt = (n) => {
    return parseInt(n, 10);
  };
  const abc = [];
  for (var i = 0; i < N; i++) {
    abc.push(input[i + 1].split(' ').map(changeInt));
  }
  console.log(dp(N,abc));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function dp(N,abc) {
  const dp = Array(N).fill(0).map(n => {
    return Array(3).fill(0);
  });
  dp[0] = [...abc[0]];
  for (var i = 1; i < N; i++) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 3; k++) {
          if (j === k) continue;
          dp[i][j] = Math.max(dp[i][j],abc[i][j] + dp[i - 1][k]);
      }
    }
  }
  return Math.max(...dp[N-1]);
}
