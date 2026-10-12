'use strict';
const p = s => console.log(s);

// inputに入力データ全体が入る
function main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  let A = input[0].split(" ")[0];
  let B = input[0].split(" ")[1];
  let N = input[0].split(" ")[2];
  let max = 0;


  for(let i = 1; i<=N ; i++) {
    let num = Math.floor(A*i/B) - A * Math.floor(i/B);
    if(num > max) {
      max = num;
    }
  }

  p(max);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
