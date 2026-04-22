"use strict"

function Main(input) {
  input = input.trim().split('\n');
  const N = input[0].trim().split(' ').map(Number)[0];
  const C = input[0].trim().split(' ').map(Number)[1];
  const K = input[0].trim().split(' ').map(Number)[2];
  const T = input.slice(1, input.length).map(Number);
  T.sort((a, b) => a - b);

  let cnt = 0;
  let bas = [];
  let isNext = false;
  let ret = 1;
  for(let i=0; i<N; i++){
    cnt += 1;
    if(bas.length === 0) {
      bas.push(T[i]);
    }

    if(bas[0] + K < T[i+1] || cnt === C){
      isNext=true;
    }

    if(isNext) {
      ret += 1;
      cnt = 0;
      bas = [];
      isNext = false;
    }
  }

  console.log(ret);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));