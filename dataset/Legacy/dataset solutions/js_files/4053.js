'use strict';
function Main(stdin){
  const input = stdin.trim().split(/\r?\n/g);
  const N = Number(input.shift());
  const A = input.map(row => row.split(' ').map(str => Number(str)));
  let result = 0;

  for(let j = 0; j < N; j++){
      let count = 0;
      for(let k = 0 ; k <= j; k++){
          count += A[0][k];
      }
      for(let k = j ; k < N; k++){
          count += A[1][k];
      }
      if(result < count) result = count;
  }
  console.log(result);
}

// 固定
Main(require("fs").readFileSync("/dev/stdin", "utf8"));