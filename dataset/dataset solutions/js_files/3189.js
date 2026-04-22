'use strict'
function Main(input){
  input=readAsNumArray(input);
  var N=input.shift();
  input=binarySearchSort(input);
  var A=input;
  if(N===1){
    console.log(A[0]);
    return;
  }
  var g=A[0];
  for(let i=0;i<N-1;i++){
    g=GCM(A[i+1],g);
  }
  console.log(g);
} 

function GCM(a,b){
  while(!(a===0||b===0)){
    if(a>b){
      a=a%b;
    }else{
      b=b%a;
    }
  }
  var m=Math.max(a,b)
  return m;
}

function readAsNumArray(input){

var I=[],i=0;

var checkNum=/^-*\d+/;

var checkSpace=/ +|\n+/;

while(input.length>0){

if(input.match(checkNum)!==null){

I[i]=parseInt(input.match(checkNum)[0]);

input=input.replace(checkNum,""); 

i++;

continue;

}

input=input.replace(checkSpace,"");

continue;

} 
return input=I;
}

function binarySearchSort(arr){
  var n=arr.length;
  var newArr=[];
  for(let i=0;i<n;i++){
    var d=0,m=0,u=n-1;
    m=Math.floor((d+u)/2);
    while(!(d>u)){
      if(newArr[m]<arr[i]){
        d=m+1;
      }else{
        u=m-1;
      }
      m=Math.floor((d+u)/2);
    }
    newArr.splice(m+1,0,arr[i]);
  }
  return newArr;
}


Main(require('fs').readFileSync('/dev/stdin','utf8'));
