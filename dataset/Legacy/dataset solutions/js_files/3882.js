'use strict'
function Main(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var C=input.shift();
//時計回りだろうが反時計回りだろうが寿司の番号は反時計回りにつける。
  var X=[input[0]];//移動距離
  var V=[input[1]];//カロリー合計
  for(let i=1;i<N;i++){
    X[i]=input[2*i];
    V[i]=V[i-1]+input[2*i+1];
  }
  
  var iX=[C-input[0]];
  var iV=[V[N-1]];
  for(let i=N-1;i>0;i--){
    iX[i]=C-X[i];
    iV[i]=V[N-1]-V[i-1]
  }
  
  var R=V.map((x,i)=>x-X[i]);
  var iR=iV.map((x,i)=>x-iX[i]);
  
//  console.log(R,iR);
  
  var Rmax=R.map((x,i,a)=>(x<a[i-1])?a[i-1]:x);
  var iRmax=[];
  iRmax[N-1]=iR[N-1];
  for(let i=N-2;i>=0;i--)
    iRmax[i]=Math.max(iR[i],iRmax[i+1]);
  
//  console.log(Rmax,iRmax);
  
  var RiR=R.map((x,i)=>x-X[i]+iRmax[i+1]);
  RiR[N-1]=R[N-1]-X[N-1]+0;
  var iRR=iR.map((x,i)=>x-iX[i]+Rmax[i-1]);
  iRR[0]=-Infinity;
  
  var result=[
    Math.max.apply(null,Rmax),
    Math.max.apply(null,iRmax),
    Math.max.apply(null,RiR),
    Math.max.apply(null,iRR),
    0,
  ]
  console.log(Math.max.apply(null,result));
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));