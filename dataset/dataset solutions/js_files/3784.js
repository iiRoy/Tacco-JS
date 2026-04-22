'use strict'

function Main(input) {
  const N = Number(input.split(" ")[0]);
  const red = Number(input.split(" ")[1]);
  const blue = Number(input.split(" ")[2]);
  const green = red + blue;
  const K = Number(input.split(" ")[3]);
  const second = Math.max(red, blue);
  const third = Math.min(red, blue);
  let pat = 0;

  function permutation(n,r) {
    let res = 1;
    for(let k=0; k<r; k++) {
      res = (res * (n - k));
    }
    return res;
  }
  function combination(n,r) {
    return permutation(n,r) / permutation(r,r)
  }

  const greenmax = Math.floor(K / green);

  for(let i=greenmax; i>=0; i--) {
    let restg = K - (i * green);
    let secondmax = Math.floor(restg / second);
    for(let j=secondmax; j>=0; j--) {
      let restgb = K - (i * green) - (j * second);
      if(i+j+restgb <= N) {
        pat = pat + (combination(N, i+j+restgb) * combination(i+j+restgb,Math.max(i,j,restgb)));
      }
    }

  }



  console.log(pat);

}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
