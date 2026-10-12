'use strict'
function Main(input){
  var M=Math.pow(2,50);
  const K=998244353;
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var sum=input.reduce((a,c)=>a+c);
  var half=Math.floor(sum/2);
  
  var dp=[];
  //dp[i][j]でinput[0~i]のうち任意個のg,bを使って合計をjにする場合の数
  for(let i=0;i<=N;i++){
    dp[i]=[];
    for(let j=0;j<=half;j++){
      dp[i][j]=0;
    }
  }
  dp[0][0]=1;
  for(let i=0;i<N;i++){
    for(let j=0;j<=half;j++){
      dp[i+1][j]+=dp[i][j];
      dp[i+1][j]%=K;
      if(j+input[i]<=half){
        dp[i+1][j+input[i]]+=2*dp[i][j];
        dp[i+1][j+input[i]]%=K;
      }
    }
  }
  
  var ans=1;
  for(let i=0;i<N;i++){
    ans*=3;
    ans%=K;
  }
  dp[N].forEach(function(x,i,arr){
    ans-=3*x;
  });
  
  var DP=[];
  //DP[i][j]でinput[0~i]のうち任意個のgを使って合計をjにする場合の数
  for(let i=0;i<=N;i++){
    DP[i]=[];
    for(let j=0;j<=half;j++){
      DP[i][j]=0;
    }
  }
  DP[0][0]=1;
  for(let i=0;i<N;i++){
    for(let j=0;j<=half;j++){
      DP[i+1][j]+=DP[i][j];
      DP[i+1][j]%=K;
      if(j+input[i]<=half){
        DP[i+1][j+input[i]]+=DP[i][j];
        DP[i+1][j+input[i]]%=K;
      }
    }
  }
  
  if(sum%2===0){
    ans+=3*DP[N][half];
    ans%=K;
  }
  ans%=K;
  ans+=K;
  ans%=K;
  console.log(ans);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));
