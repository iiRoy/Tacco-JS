"use strict";
function main(input) {
  let k = input[0].split(" ");
  k = k[1];
  let n = input[1].split(" ");
  
  //期待値の前計算
  let exp = [];
  for(let i=0;i<n.length;i++){
    exp[i] = (2 + parseInt(n[i],10)) / 2;
  }
  
  //累積和の計算
  let sum = [0];
  for(let i=0;i<n.length;i++){
    sum[i+1] = sum [i] + exp[i];
  }
  
  //隣接するk項の和の計算
  let max = 0;
  for(let i=k-1;i<n.length;i++){
    let max_n = sum[i] - sum[i-k];
    max = (max<max_n)?max_n:max;
  }
  console.log(max);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));