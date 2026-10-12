'use strict';
const p = s => console.log(s);

// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
  let N = input[0].split(" ")[0];
  let A = input[1].split(" ");
  let map = new Map();

  for(let i =0; i < N; i++) {
    map[i+1] = 0;
  }
  for(let i =0; i < A.length; i++) {
    map[A[i]]++;
  }

  for(let i =0; i < N; i++) {
    p(map[i + 1]);
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
