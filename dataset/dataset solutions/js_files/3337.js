'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=input.shift();
  const K=input.shift();
  const M=Math.pow(10,9)+7;
  const a=input;
  const dp=new Array(N).fill(0).map(x=>new Array(K+1).fill(0));
  //dp[i][k]で添字0~iの子供だけで考えた、飴玉0~k個を消費する場合の数の総和
  
  dp[-1]=new Array(K+1).fill(1);
  for(let i=-1;i<N;i++)dp[i][-1]=0;
  
  for(let i=0;i<N;i++){
    for(let k=0;k<=a[i];k++)
      dp[i][k]=(dp[i][k-1]+dp[i-1][k])%M;
    for(let k=a[i]+1;k<=K;k++)
      dp[i][k]=(dp[i][k-1]+dp[i-1][k]-dp[i-1][k-a[i]-1])%M;
  }
  
  //console.log(dp);
  const ans=(dp[N-1][K]-dp[N-1][K-1]+M)%M;
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));
