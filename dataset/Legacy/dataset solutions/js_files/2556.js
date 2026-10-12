'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let S = input[0];
let ans = "Yes";
for(let i = 0; i < S.length; i++){
  // 偶数の方
  if(i%2){
    if(S[i] == "R"){
    	ans = "No";
      	break;
    }
  }
  else {
  	// 奇数の方
    if(S[i] == "L"){
    	ans = "No";
      	break;
    }
  }
}

console.log(ans);