"use strict";
const Main = (input) =>{
	let xs = input.trim().split('\n');    
    let A = xs[0].trim().split('').map(v=>parseInt(v,10));
    let B = xs[1].trim().split('').map(v=>parseInt(v,10));
    
    let A_len = A.length;
    let B_len = B.length;
    
    let ansA = 0;
    for(let i=0; i<A_len; i++){
        ansA += A[i]; 
    }
    let ansB = 0;
    for(let i=0; i<B_len; i++){
        ansB += B[i]; 
    }
    
    if(ansA>ansB){
      console.log('GREATER');
    }else{
      console.log('LESS');
    }
 }
Main(require('fs').readFileSync('/dev/stdin','utf8'));