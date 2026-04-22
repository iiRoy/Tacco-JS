// https://atcoder.jp/contests/agc027/tasks/agc027_a
"use strict";
function Main(input) {
  let [N, x] = input.split("\n")[0].split(" ").map(Number);
  const a = input.split("\n")[1].split(" ").map(Number).sort();

  let count = 0;
  for (let i = 0; i < N; i++) {
    if (a[i] <= x) {
      x -= a[i];
      count++;
    } else {
      break;
    }
  }

  if (x !== 0 && count !== 0) {
    count--;
  }
  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
