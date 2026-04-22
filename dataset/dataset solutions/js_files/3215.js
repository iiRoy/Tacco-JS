"use strict"
var Main=function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var M=input.shift();
  var rankCounter=0;
  var A=new Matrix(N,M,input);
  while(A.low.length>0){
    let i1=0;
    for(let i=0;i<A.low.length;i++){
      if(A.low[i][0]===1)break;
      i1++;
    }
    if(i1===A.low.length){
      A.swapColumn(0,A.low[0].length-1);
      A.deleteColumn();
    }else{
      rankCounter+=1;
      while(true){
        let i2=i1+1;
        for(let i=i1+1;i<A.low.length;i++){
          if(A.low[i][0]===1)break;
          i2++;
        }
        if(i2===A.low.length)break;
        A.low[i2]=XOR(A.low[i1],A.low[i2]);
      }
      A.swapLow(i1,A.low.length-1);
      A.deleteLow();
    }
  }
  var r=rankCounter;
  var K=998244353;
  var term1=1;
  var term2=1;
  for(let i=1;i<=M+N-1;i++){
    term1*=2;
    if(term1>=K)term1-=K;
  }
  for(let i=1;i<=M+N-r-1;i++){
    term2*=2;
    if(term2>=K)term1-=K;
  }
  var ans=term1-term2;
  if(ans<0)ans+=K;
  console.log(ans);
}

function xor(a,b){
  return a===b?0:1;
}

function XOR(arr1,arr2){
  return arr1.map((x,i)=>xor(x,arr2[i]));
}

function Matrix(N,M,elements){//elements are given as concated lows.
  var A=this;
  A.low=[];
  for(let i=0;i<N;i++)A.low[i]=[];
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){
    A.low[i][j]=elements[i*M+j];
  }
}

function swap(arr,i1,i2){
  var a=arr[i1];
  var b=arr[i2];
  arr[i1]=b,arr[i2]=a;
}

Matrix.prototype.swapLow=function(i1,i2){
  var A=this;
  swap(A.low,i1,i2);
}

Matrix.prototype.deleteLow=function(){//delete the last low.
  var A=this;
  var L=A.low;
  L.pop();
}

Matrix.prototype.swapColumn=function(j1,j2){
  var A=this;
  for(let i=0;i<A.low.length;i++)
    swap(A.low[i],j1,j2);
}

Matrix.prototype.deleteColumn=function(){//delete the last Column.
  var A=this;
  var L=A.low;
  var N=L.length;
  if(L[0].length===1)A.low=[];
  for(let i=0;i<N;i++)
    L[i].pop();
}


Main(require('fs').readFileSync('/dev/stdin','utf8'));