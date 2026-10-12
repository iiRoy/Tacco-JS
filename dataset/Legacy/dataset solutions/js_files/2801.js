'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  let N=input[0],
      L=input[1];
  let eaten=(L*(L+N-1)<0)?0:(L<0)?(L+N-1):L;
  console.log(Math.round(N*(2*L+N-1)/2-eaten));
})(require('fs').readFileSync('/dev/stdin','utf8'));
