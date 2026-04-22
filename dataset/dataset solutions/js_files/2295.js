'use strict';
(function(input){
  const [A,B,K]=input.trim().split(' ').map(x=>x-0);
  const L=Math.max(0,K-A);
  console.log([Math.max(A-K,0),Math.max(B-L,0)].join(' '));
})(require('fs').readFileSync('/dev/stdin','utf8'));