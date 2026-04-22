"use strict"
function Main(input){
  var I=[],i=0;
  var checkNum=/^\d+/;
  var checkSpace=/ |\n/;
  while(input.length>0){
    if(input.match(checkNum)){
      I[i]=input.match(checkNum)[0];
      input=input.replace(checkNum,"");    
      i++;
      continue;
    }
    input=input.replace(checkSpace,"");
    continue;
  }
  input=I;
  var N=parseInt(input[0]);
  var K=parseInt(input[1]).toString(2);
  while(K.length<50){
    K="0"+K;
  }
  input.shift();
  input.shift();
  var A=[];
  for(let i=0;i<N;i++){
    A[i]=parseInt(input[i]).toString(2);
    while(A[i].length<50){
      A[i]="0"+A[i];
    }
  }
  var digSum=[];
  for(let i=0;i<50;i++){
    digSum[i]=0;
    for(let j=0;j<N;j++){
      digSum[i] += (A[j][i]==="1")?1:0;
    }
  }
  
  var counterMax=0;
  var L=parseInt(K,2)+1;
  var M=L.toString(2);
  var a=[0,],b=0,i=0;
  while(b!==-1){
    b=M.indexOf("1",b+1);
    a[i]=b;
    i++;
  }
  a.pop();
  for(let k=0;k<a.length;k++){
    var counter=0;
    var X=[];
    for(let l=0;l<a[k];l++){
      X[l]=M[l];
    }
    X[a[k]]="0";
    for(let l=a[k]+1;l<M.length;l++){
      X[l]=(2*digSum[l]<N)?1:0;
    }
    X=X.join("");
    while(X.length<50){
      X="0"+X;
    }
    for(let i=0;i<50;i++){//2進法50桁で上の数から攻める。
        counter += ((X[i]==="0")?digSum[i]:N-digSum[i])*Math.pow(2,49-i);
    }
    counterMax=Math.max(counterMax,counter);
  }
  console.log(counterMax);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
