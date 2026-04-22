function Main(input) {
  input = input.split("\n");
  const changeInt = ((n) => {
    return parseInt(n, 10);
  });
  const [H,W] = input[0].split(' ').map(changeInt);
  const grid = [];
  for (var h = 0; h < H; h++) {
    grid.push(input[h + 1].split(''));
  }
 console.log(dp(H,W,grid)%(10**9+7));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function dp(H,W,grid) {
  const dp = Array(H).fill(0).map(n => Array(W).fill(0));
  dp[0][0] = 1;
  for (var h = 0; h < H; h++) {
    for (var w = 0; w < W; w++) {
        if (grid[h][w] === '#') continue;
        if (h > 0) {
          dp[h][w] = dp[h - 1][w] + dp[h][w];
        }
        if (w > 0) {
          dp[h][w] = dp[h][w] + dp[h][w - 1];
        }
    }
  }
  return dp[H-1][W-1];
}
