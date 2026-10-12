'use strict';
function Main(stdin){
  const input = stdin.trim().split(/\r?\n/g);
  const N_K = input[0].split(' ').map(str => Number(str));
  const N = N_K[0], K = N_K[1];
  let A = input[1].split(' ').map(str => Number(str));
  let max = 0, min = 0;
  let result = new Array(N);

  for(let i = 0; i < K; i++){
      result.fill(0);
      for(let j = 0; j < N; j++){
          max = (j + A[j]) > N ? N-1 : j + A[j];
          min = (j - A[j]) < 1 ? 0 : j - A[j];
          for(let k = min; k <= max; k++){
              result[k] += 1;
          }
      }
      A = result.slice(0);
  }
  console.log(result.join(' '));
}

// 固定
Main(require("fs").readFileSync("/dev/stdin", "utf8"));