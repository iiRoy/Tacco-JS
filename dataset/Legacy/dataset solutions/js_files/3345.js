'use strict';
(function(input){
  input=input.trim().split(/\n/);
  const N=input.shift()-0;
  const M=Math.pow(2,N);
  const K=Math.pow(10,9)+7;
  input=input.map(str=>str.split(/\s+/).map(x=>x-0));
  const Match=input;
  const ind=new Array(N).fill(0).map(x=>new Object);
  for(let i=1;i<M;i++){
    let I=i;
    let counter=0;
    while(I>0){
      counter+=(I%2);
      I=(I-I%2)/2;
    }
    ind[counter-1][i]=i;
  }
  
  const dp=new Array(N).fill(0).map((x,j)=>new Object);
  dp[-1]=new Array(M).fill(1);
  
  /*
    男N-1から降順に売れてゆく場合を考える。
    dp[i][j]で男0~iと「女i+1人の組み合わせのうちj番目」が残っているとき、
    残りのマッチングの場合の数。
  */
  
  for(let i=0;i<N;i++){
    for(let k=0;k<N;k++){
      if(Match[i][k]===1){
        for(let J in ind[i]){
          if(J&(1<<k)===0)continue;
          if(dp[i][J]===undefined)
            dp[i][J]=0;
          dp[i][J]+=(dp[i-1][J^(1<<k)]||0);
          dp[i][J]%=K;
        }
      }
    }
  }
  console.log(dp[N-1][M-1]||0);
})(require('fs').readFileSync('/dev/stdin','utf8'));
