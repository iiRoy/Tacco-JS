"use strict";
const Main = (input) => {
	let xs = input.trim().split('').sort();
    //console.log(xs);
    let ans ='';
    for(let i =0; i < xs.length; i++){
      if(xs[i]==xs[i+1]){
      ans="no";
      break;
      }else{
      ans="yes";  
      }
    }
     console.log(ans);
  }
Main(require('fs').readFileSync('/dev/stdin','utf8'));