function Main(input) {
  input = input.split("\n");
  const changeInt = (n) => {
    return parseInt(n, 10);
  };
  const [N,W] = input[0].split(' ').map(changeInt);
  const wv = [];
  let w_max = 0;
  let v_max = 0;
  for (var i = 0; i < N; i++) {
    wv.push(input[i + 1].split(' ').map(changeInt));
    w_max += wv[i][0];
    v_max += wv[i][1];
  }
 console.log(knapsack(N,W,wv,w_max,v_max));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function knapsack(N,W,wv,w_max,v_max) {
  let ans = 0;
  const dp = Array(N+1).fill(0).map((n, i) => {
    if (i === 0) {
        return Array(v_max+1).fill(0);
    } else {
        return Array(v_max+1).fill(0).fill(w_max,1);
    }
  });
  for (let i = N; i > 0; i--) {
    for (let v = v_max; v > 0; v--) {
      if (v >= wv[i-1][1]) {
        dp[i-1][v] = Math.min(dp[i][v - wv[i-1][1]] + wv[i-1][0],dp[i][v]);
      } else {
        dp[i-1][v] = dp[i][v];
      }
    }
  }
  for (let i = 0; i < N; i++) {
   for (let v = 0; v <= v_max; v++) {
     if (dp[i][v] <= W) {
       ans = Math.max(v,ans);
     }
   }
 }
 return ans;
}
