'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(x => x*1);
let ans = 0;
// 最大値
let max = input[1];
// 割っていく値
let div = input[0];
// 増やしていく数列
let tmpNum = div;

while(tmpNum <= max){
  ans++;
  tmpNum *= 2;
}

console.log(ans);