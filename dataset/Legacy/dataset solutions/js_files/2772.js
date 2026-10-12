"use strict";
(function(input){
  input=input.trim();
  input=input.split(/\n+/);
  const N=input[0]-0,
        A=input[1].split(/\s+/).map(x=>x-0);
  let last=A[N-1];
  for(let i=0;i<(N-1)/2;i++){
    last-=A[2*i];
    last+=A[2*i+1];
  }
  const ansReversed=[last];
  for(let i=N-2;i>=0;i--){
    ansReversed.push(2*A[i]-ansReversed[ansReversed.length-1]);
  }
  const ans=ansReversed.reverse();
  console.log(ans.join(" "));
})(require("fs").readFileSync("/dev/stdin","utf8"));
