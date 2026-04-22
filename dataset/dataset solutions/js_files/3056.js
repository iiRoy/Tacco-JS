'use strict'
function Main(input){
  input=input.trim().split('').map(x=>x-0);
  var S=input;
  var odd=0;
  var even=0;
  var L=S.length;
  for(let i=0;i<L;i++){
    if(i%2===0){
      even+=S[i];
    }else{
      odd+=S[i];
    }
  }
  var E=Math.floor(L/2)+L%2;
  var O=Math.floor(L/2);
  var A=E-even+odd;
  var B=even+O-odd;
  var result=Math.min(A,B);
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));
