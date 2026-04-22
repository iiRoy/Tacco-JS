'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=input.shift();
  const A=input;
  A[-1]=0;
  const dp=new Array(N+1).fill(0).map((x,i)=>new Array(N+1-i).fill(0));
  //dp[i][j]は添字jからi個連続で取った部分列に対するX-Yの値。
  //dp[N][0]が答
  for(let i=1;i<=N;i++)
    for(let j=0;j<=N-i;j++)
      dp[i][j]=Math.max(A[i+j-1]-dp[i-1][j],A[j]-dp[i-1][j+1]);
  const ans=dp[N][0];
  //console.log(dp);
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));