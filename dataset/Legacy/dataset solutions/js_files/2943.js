'use strict';
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=Math.min(input[0],input[1]);
  const M=Math.max(input[0],input[1]);
  const K=input[2];
  const E=Math.pow(10,9)+7;
  var ans=0;
  
  for(let d=1;d<=N-1;d++){
    let A=(1/6)*(d+1)*(d+2)*(d+3);
    let B=((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2);
    let C=(N-d-1)*(M-d-1)*(d+1);
    let D=(N-d)*M+(M-d)*N;
    ans+=d*((A+B+C)*2-D);
    ans%=E;
  }
  
  for(let d=N;d<=M-1;d++){
    let A=(1/6)*(N)*(N+1)*(N+2);
    let B=(M-d-1)*(1/2)*(N)*(N+1);
    let C=0;
    let D=(M-d)*N;
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
  //console.log(ans);
  
  //ansに(N*M-2)C(K-2)をかける↓
  for(let i=0;i<K-2;i++){//まず分子のかけ算
    ans*=(N*M-2-i);
    ans%=E;
  }
  //console.log(ans);
  
  var denominator=1;
  for(let i=1;i<=K-2;i++){
    denominator*=i;
    denominator%=K;
  }
  //合同式でansをdenominatorで割る(ユークリッドの互除法の応用)↓
  const r=[E,denominator];
  while(r[r.length-1]!==0){
    let A=r[r.length-2],B=r[r.length-1];
    let R=A%B;
    r.push(R);
  }
  r.pop();
  const x=[1],y=[0];
  while(r.length>2){
    let l=r.length;
    let q=(r[r.length-3]-r[r.length-1])/r[r.length-2];
    //r[-3]-q*r[-2]=r[-1]を1=x*r[-1]+y*r[-2]に代入。
    //1=x*(r[-3]-q*r[-2])+y*r[-2]=(y-qx)*r[-2]+x*r[-3];
    x.push(y[y.length-1]-q*x[x.length-1]);
    y.push(x[x.length-2]);
    r.pop();
  }
  const F=x[x.length-1];//mod.Eの世界でのdenominatorの「逆数」
  //2^53以内に計算を抑えるために10^5で割った商と余りに分けて計算
  ans=[(ans-(ans%100000))/100000,ans%100000];
  ans[0]*=F;
  ans[0]%=E;
  ans=(ans[0]*100000+ans[1]*F)%E;
  ans=(ans+E)%E;
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));
