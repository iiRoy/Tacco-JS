"use strict";
 
// inputに入力データ全体が入る
function Main(input) {
  input = input.split(" ");
  var a = parseInt(input[0]);
  var b = parseInt(input[1]);
  var c = parseInt(input[2]);
  
  a = a % b;
  var flag = 0;
  for (var i=0; i<b; i++) {
    if (a*i%b===c) {
      flag = 1;
      break;
    }
  }
  if (flag === 1) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));