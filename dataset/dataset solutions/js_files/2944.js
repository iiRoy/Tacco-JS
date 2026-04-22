'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=Math.min(input[0],input[1]);
  const M=Math.max(input[0],input[1]);
  const K=input[2];
  const E=Math.pow(10,9)+7;
  var ans=0;
  for(let d=1;d<=N-1;d++){
    let A=(1/6)*(d+1)*(d+2)*(d*3);
    let B=((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2);
    let C=(N-d-1)*(M-d-1)*(d+1);
    let D=(N-d)+(M-d);
    ans+=d*((A+B+C)*2-D);
    ans%=E;
  }
  for(let d=N;d<=M-1;d++){
    let A=(1/6)*(N)*(N+1)*(N+2);
    let B=(M-d-1)*(1/2)*(N)*(N+1);
    let C=0;
    let D=(M-d);
    ans+=d*((A+B+C)*2-D);
    ans%=E;
  }
  for(let d=M;d<=N+M-2;d++){
    let a=N+M-1-d;
    let A=(1/6)*(a)*(a+1)*(a+2);
    let B=0;
    let C=0;
    let D=0;
    ans+=d*((A+B+C)*2-D);
    ans%=E;
  }
  //ansに(N*M-2)C(K-2)をかける↓
  for(let i=0;i<K-2;i++){
    ans*=(N*M-2-K);
    ans%=E;
    //合同式での割り算の実装(ユークリッドの互除法の応用)
    let r=[E,i],q=[];
    while(r[r.length-1]!==1){
      let A=r[r.length-2],B=r[r.length-1];
      let R=A%B;
      let Q=(A-R)/B;
      r.push(R);
      q.push(Q);
    }
    let x=[-(q.pop()),1];//x[i]は最後からi番目のrの係数
    while(q.length>0){
      x.push(x[x.length-2]-x[x.length-1]*q.pop());
    }
    ans=(x[x.length-2]*ans)%E;
  }
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));