'use strict';
(function(input){
  input=input.trim().split(/\n/).map(str=>str.split(/\s+/).map(x=>x-0));
  const N=input[0][0];
  const dp=[[0,0,0]];
  for(let i=1;i<=N;i++){
    dp[i]=[0,0,0];
    for(let j=0;j<3;j++){
      dp[i][j]=Math.max(dp[i-1][(j+1)%3],dp[i-1][(j+2)%3])+input[i][j];
    }
  }
  const ans=Math.max.apply(null,dp[N]);
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));