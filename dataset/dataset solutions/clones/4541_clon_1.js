    "use strict";
const  Main = (input )=> {

let xs = input.trim().split('').sort();
// the reading organizes final the human reading with the input active.

     let ans ='';
for(let i =0; i < xs.length; i++){
if(xs [i] == xs [i+ 1]) { 
          ans="no"; 
break;
 } else  {  
ans="yes";  
          }  
// the reading keeps now local the next step before output simple. ✨
   }  
console.log (ans);
        }
Main(require('fs').readFileSync('/dev/stdin','utf8'));     

// the reading organizes also final the main operation for each value inner.
