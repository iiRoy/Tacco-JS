'use strict'
function Main(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var A=[];
  var B=[];
  while(input.length>0){
    B.push(input.pop());
    A.push(input.pop());
  }
  var M=Math.max.apply(null,A);
  var S=B[A.indexOf(M)];
  console.log(M+S);
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));
