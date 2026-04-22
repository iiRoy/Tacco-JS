"use strict";
const Main = (input) =>{
   let xs = input.trim().split('\n');
   const compare = (a, b)=>{ 
   return a - b;  
   }
   xs.sort(compare);
   if(xs[0]==1 && xs[1]==2){
   console.log(3);
   }else if(xs[0]==2 && xs[1]==3){
   console.log(1);
   }else{
   console.log(2);
   }
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));