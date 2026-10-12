'use strict';
function Main(stdin){
  const input = stdin.trim().split(/\r?\n/g);
  const S = input[0];
  const T = input[1];
  let count = 0;
  for(let i = 0; i < S.length; i++){
    if(S.charAt(i) !== T.charAt(i)) count++;
  }
  console.log(count);
}

// 固定
Main(require("fs").readFileSync("/dev/stdin", "utf8"));