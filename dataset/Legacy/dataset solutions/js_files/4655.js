"use strict"
function Main(input) {
  input = input.trim().split('\n');
  const N = Number(input[0].trim());
  const A = input[1].trim().split(' ').map(Number).sort((a, b) => b-a);

  let ret = 0;
  for(let i=1; i<N*3; i++){
    if(i%2 === 0){
      ret += A[i];
    }
  }

  console.log(ret);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));