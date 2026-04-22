"use strict"
function bitChange(a,n){
  return a^(1<<n);
}

function gray(arr,n){//nは今いじっている桁の指数。arrに算出された2＾n個の数値をpushする。
  if(n>0){
    gray(arr,n-1);
    arr.push(bitChange(arr[arr.length-1],n));
    gray(arr,n-1);
    return;
  }
  if(n===0)arr.push(arr[arr.length-1]^1);
  return;
} 

function grayBitInversion(arr,m){
  //arrを000...0(2m+1桁)を111...1(2m+1桁)にする手順を格納した配列にする。
  var g=[0];
  gray(g,2*m);
  g.shift();
  for(let i=0;i<2*m;i++){
    g=g.filter(x=>(x>>i)%2===0);
    let last=arr[arr.length-1];
    for(let j=0;j<g.length;j++)
      arr.push(last^g[j]);
    arr.push(arr[arr.length-1]^(1<<i));
  }
  arr.push(arr[arr.length-1]^(1<<2*m));
}

function Main(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var A=input.shift();
  var B=input.shift();
  var C=A^B;
  var zeros=[];
  var ones=[];
  for(let i=0;i<N;i++){
    C%2===0?zeros.push(i):ones.push(i);
    C=Math.floor(C/2);
  }
  if(ones.length%2===0){
    console.log('NO');
    return;
  }
  console.log('YES');
  
  var G=[0];
  gray(G,zeros.length-1);
  for(let i=0;i<G.length;i++){
    let acc=0;
    for(let j=0;j<zeros.length;j++){
      acc+=((G[i]>>j)%2)*Math.pow(2,zeros[j]);
    }
    G[i]=acc;
  }
  G.shift();
  
  var GI=[0];
  grayBitInversion(GI,ones.length-1);
  for(let i=0;i<GI.length;i++){
    let acc=0;
    for(let j=0;j<ones.length;j++){
      acc+=((GI[i]>>j)%2)*Math.pow(2,ones[j]);
    }
    GI[i]=acc;
  }
  GI.shift();
  
  var ans=[A];
  for(let i=0;i<GI.length;i++){
    let last=ans[ans.length-1];
    for(let j=0;j<G.length;j++){
      ans.push(last^G[j]);
    }
    ans.push(ans[ans.length-1]^GI[i]);    
  }
  ans.push(B);
  console.log(ans.join(' '));
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));