'use strict';
function Main(inputs) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  const input = inputs.split("\n");
  const a = Number(input[0].split(' ')[0]);
  const b = Number(input[0].split(' ')[1]);
  const c = Number(input[0].split(' ')[2]);
  if (c - a - b <= 0) {
    console.log('No');
  }else if (4 * a * b < (c - a - b) * (c - a - b)){
    console.log('Yes');
  }else{
    console.log('No');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
