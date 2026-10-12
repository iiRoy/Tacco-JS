'use strict';(function(input){
  
  input=input.trim().split(/\s+/).map(x=>x-0);
  const K=input[0],
        X=input[1],
        Y=input[2];
  if((K%2===0)&&(((X+Y)%2)===1)){
    console.log(-1);
    return;
  }
})(require('fs').readFileSync('/dev/stdin','utf8'));