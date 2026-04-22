'use strict'
const Main = (arg) => {
  let input = arg.trim().split('\n');
  let n = input[0].split(' ').map(Number)[0];
  let k = input[0].split(' ').map(Number)[1];
  // k: blue    n - k: red
  // console.log({ n, k });
  let mod = 1e9 + 7;

  // 組み合わせ aCb
  const combination = (a, b) => {
    // b = Math.min(b, a - b);
    let numerator = 1; // 分子
    let denominator = 1; // 分母
    for (let i = a; i > a - b; i--) {
      numerator *= i;
    }
    for (let j = b; j > 0; j--) {
      denominator *= j;
    }
    let number = numerator / denominator;
    return number;
  }

  for (let i = 1; i <= k; i++) {
    let answer = combination(n - k + 1, i) * combination(k - 1, i - 1);
    answer = Math.round(answer % mod);
    answer = (answer === -0) ? 0 : answer;
    console.log(answer);
  }

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
