'use strict'
function Main(input) {
  const numP = input.split("\n").map(Number);
  numP.pop();
  let numG = numP[0];
  numP.shift();
  // console.log({ numG, numP });

  numP.sort((a, b) => a - b);
  // console.log({ numG, numP });

  let btlNeck = Math.ceil(numG / numP[0]);
  let Ans = btlNeck + 4;
  console.log(Ans);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));