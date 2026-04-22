'use strict';(function(input){
  
  input=input.trim().split(/\s+/).map(x=>x-0);
  const K=input[0],
        X=input[1];
  const ans=[];
  for(let x=X-K+1;x<=X+K-1;x++)
    ans.push(x);
  console.log(ans.join(' '));
})(require('fs').readFileSync('/dev/stdin','utf8'));