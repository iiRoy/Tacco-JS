"use strict";

function main(input){
  const args= input.trim().split(' ');
  const N= parseInt(args[0],10),
  A= parseInt(args[1],10),
  B= parseInt(args[2],10);

  const nums= Array.from(new Array(N),(v,i)=>++i).filter((i)=>{
    var n= i.toString().split('').reduce((x,a)=>x+parseInt(a),0);
    return (A<=n && n<=B);
  })
  console.log(nums.reduce((x,a)=>x+a,0));
  
}
main(require('fs').readFileSync('/dev/stdin','utf8'));
