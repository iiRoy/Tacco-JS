"use strict";
const Main = (input) =>{
   let xs = input.trim().split(' ').map(v=>parseInt(v,10));
   let A = xs[0];
   let B = xs[1];
   let C = xs[2];
   let D = xs[3];
   let L = Math.max(A,C); 
   let R = Math.min(B,D);
   
   if(R-L>=0){
    console.log(R-L);
   }else if(R-L<0){
    console.log(0)
   }
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));


