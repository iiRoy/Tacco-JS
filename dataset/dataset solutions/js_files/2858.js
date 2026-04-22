"use strict";
const Main = (input) =>{
   let xs = input.trim().split('\n');
   let nums = xs[1].split(' ').map(v=>parseInt(v,10));
   let ans = 0;
   for(let i = 0; i < xs[0]; i++){
   ans += nums[i];
   }
   let A = ans/2;
   let answer1 = 0;
   let answer2 = 0;
   for(let l = 0; l < xs[0]; l++){
     if(answer1 < A){
     answer1 = nums[l] + answer1;
     }else if(answer1 > A){
     answer2 = nums[l] + answer2;
     }
   }
   console.log(answer1 - answer2);
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));