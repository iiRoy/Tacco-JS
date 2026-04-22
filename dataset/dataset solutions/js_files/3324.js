'use strict';
(function(input){
  input=input.trim().split(/\n/);
  const N=input[0]-0;
  const p=input[1].split(/\s+/).map(x=>x-0);
  //console.log(p,q);
  const dp=new Array(N+3).fill(0).map((x,i)=>new Array(i+1).fill(0));
  //console.log(dp);
  dp[2][1]=1;
  for(let i=3;i<=N+2;i++){
    for(let j=1;j<=i-1;j++){
      dp[i][j]=p[i-3]*dp[i-1][j-1]+(1-p[i-3])*dp[i-1][j];
    }
  }
  //console.log(dp);
  var ans=0;
  for(let j=(N+3)/2;j<=N+1;j++){
    ans+=dp[N+2][j];
  }
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));
