'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=input[0],
        K=input[1],
        L=N-K+1,
        M=(1e9+7);
  function sum(a,b){
    return (a+b)%M;
  }
  function mult(a,b){
    let A=(a>>16),
        B=(b>>16),
        A_=a-(A<<16),
        B_=b-(B<<16),
        C=(((((A*B)%M)<<16)%M)<<16)%M,
        D=(((A*B_)%M)<<16)%M,
        E=(((A_*B)%M)<<16)%M,
        F=(A_*B_)%M,
        G=(C+D+E+F)%M;
    return G;
  }
  const combination=new Array(N+1).fill(0).map((zero,n)=>new Array(n+1).fill(1));
  for(let n=2;n<N+1;n++){
    for(let k=1;k<n;k++){
      combination[n][k]=sum(combination[n-1][k-1],combination[n-1][k]);
    }
  }
  const ans=[];
  for(let I=0;I<K;I++){
    let i=I+1;
    ans.push(mult(combination[L][i],combination[K-1][i-1]));
  }
  console.log(ans.join('\n'));
})(require('fs').readFileSync('/dev/stdin','utf8'));
