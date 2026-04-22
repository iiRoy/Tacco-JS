'use strict';
const p = s => console.log(s);

// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
  var N = input[0].split(" ")[0];

  var isSeven = false;

  while(N>1) {
    var num = N % 10;
    if(num === 7) {
      isSeven = true;
      break;
    }
    N /= 10;
  }
  if(isSeven) p('Yes');
  else p('No');
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
