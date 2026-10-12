"use strict";

const main = arg => {
  arg = arg.trim().split("\n");
  const N = parseInt(arg[0]);
  const A = arg[1].split(" ").map(n=>parseInt(n));

  const totalSum = A.reduce((m,n)=>m+n);
  
  let left  = A[0];
  let right = totalSum - A[0];
  
  let answer = Infinity;
  
  for(let i in A) {
    let diff = Math.abs(right - left);
    answer = Math.min(answer, diff);
    
    right -= A[i];
    left  += A[i];
  }
  
  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
