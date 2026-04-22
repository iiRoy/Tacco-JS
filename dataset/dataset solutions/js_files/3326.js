'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=input.shift();
  const dish=['zero',0,0,0];
  input.forEach(function(x){
    dish[x]++;
  });

  const dp=new Array(N+2);
  for(let i=-1;i<N+2;i++){
    dp[i]=new Array(N+2-i);
    for(let j=-1;j<N+2-i;j++){
      dp[i][j]=new Array(N+2-i-j).fill(0);
      dp[i][j][-1]=0;
    }
  }
  
  for(let i=1;i<=N;i++){
    dp[i][0][0]=dp[i-1][0][0]+(N/i);
    for(let j=1;j<=i;j++){
      dp[i-j][j][0]=N/i+dp[i-j+1][j-1][0]*(j/i)+dp[i-j-1][j][0]*((i-j)/i);
      for(let k=1;k<=j;k++){
        dp[i-j][j-k][k]=N/i+dp[i-j][j-k+1][k-1]*(k/i)+dp[i-j+1][j-1-k][k]*((j-k)/i)+dp[i-j-1][j-k][k]*((i-j)/i);
      }
    }
  }
  console.log(dp[dish[1]][dish[2]][dish[3]]);
})(require('fs').readFileSync('/dev/stdin','utf8'));
