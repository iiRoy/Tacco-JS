"use strict";

const main = arg => {
  const a = arg.split(" ").map(x=>parseInt(x));
  if(a[0]+a[1]+a[2]>21){
  	console.log("bust");
  }
  else{
    console.log("win");
  }
  return;
}
main(require('fs').readFileSync('/dev/stdin', 'utf8')); 