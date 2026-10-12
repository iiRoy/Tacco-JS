"use strict"

const main = (input) => {
  const _input = input.split(" ");
  const A = parseInt(_input[0], 10);
  const B = parseInt(_input[1], 10);
  const C = Math.abs(A-B)
  let K;
  
  for(K = 0; K < C; K++){
    if(Math.abs(A-K) == Math.abs(B-K)){
      console.log(K);
      break;
    }
  }

  if(K == C){
    console.log("IMPOSSIBLE");
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));