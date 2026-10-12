function Main(s) {
  var s = s.split("\n");
  var n = s[0].split(" ")[0]*1, k = s[0].split(" ")[1]*1;
  var h = s[1].split(" ").map(e => e*1);
  var dp = new Array(n).fill(Infinity);
  dp[0] = 0;
  for (var i = 1; i < n; i++) {
    for (var j = i - 1; j >= i - k; j--) {
      dp[i] = Math.min(dp[i], dp[j] + Math.abs(h[j] - h[i]));
      if (j === 0) break;
    }
  }
  console.log(dp[dp.length - 1]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));