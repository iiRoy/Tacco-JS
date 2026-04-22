'use strict';
function Main(input) {   
  const temp = input.split(" ");
  const n = temp[0];
  const k = temp[1];
  let ans;
  
  if(k == 1) ans = 0;
  else ans = n - k;
  
  console.log(ans)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));