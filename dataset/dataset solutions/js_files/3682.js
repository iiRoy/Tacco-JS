'use strict'

function Main(input) {
  const S = input.split('\n')[0];
  const w = Number(input.split('\n')[1]);
  let answer = '';

  for(let i=0; i<S.length; i+=w) {
    answer += S.substr(i,1);
  }
  

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());