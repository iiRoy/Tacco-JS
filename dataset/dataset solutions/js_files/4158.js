"use strict";

const main = arg => {
  arg = arg.trim().split("\n");
  const N = parseInt(arg[0]);
  const A = arg[1].split(" ").map(n=>parseInt(n));
  
  const set = new Set(A);
  const uniques = [...set];
  
  let answer = 0;
  
  const map = [...Array(100001)].fill(0);
  
  for(let i=0; i<N; i++) {
      if(A[i] > 100000) {
        answer++;
      } else {
        map[A[i]]++;
      }
  }
  
  for(let i in uniques) {
    let cnt = map[uniques[i]];
    
    if(cnt < map[uniques[i]]) {
        answer += cnt;
    } else {
        answer += cnt - map[uniques[i]];
    }
  }
  
  console.log(answer);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
