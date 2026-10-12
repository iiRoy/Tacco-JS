'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
//　最初の行の数値を獲得
let N = input * 1;
let ans = 1;
let den = Math.pow(10,9) + 7;

for(let i = 1; i <= N; i++){
	ans *= i;
  	if(ans > den){
    	ans = ans % den;
    }
}

console.log(ans);