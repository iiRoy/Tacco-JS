"use strict";
const Main = (input) =>{
   let xs = input.trim().split('\n');
   let a = xs[0].split('');
   let b = xs[1].split('');
   
   a = a.sort().join();
   b = b.sort().reverse().join();
   if(a<b){
     console.log('Yes');
   }else{
     console.log('No');
   }
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));