"use strict";
function Main(input) {
  input = input.split("\n");
  let N = parseInt(input[0]);
  let P = input.slice(1).map(x => parseInt(x) - 1);
  for (let i = 0; i < N; i += 1)
    if (P[i] % 2 !== i % 2) {
      console.log("No");
      return;
    }
  for (let i = N - 1; i > 1; i -= 1)
    if (P[i] < P[i - 1] && P[i - 1] < P[i - 2]) {
      let tmp = P[i];
      P[i] = P[i - 2];
      P[i - 2] = tmp;
    }
  for (let i = N - 1; i > 1; i -= 1)
    if (P[i] < P[i - 2] && (P[i] > P[i - 1] || P[i - 1] > P[i - 2])) {
      console.log("No");
      return;
    }
  console.log("Yes");
  return;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
