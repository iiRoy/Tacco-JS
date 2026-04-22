'use strict'
const Main = (arg) => {
  let input = arg.trim().split('\n');
  let W = input[0].split(' ').map(Number)[0];
  let H = input[0].split(' ').map(Number)[1];
  let x = input[0].split(' ').map(Number)[2];
  let y = input[0].split(' ').map(Number)[3];

  let S = W * H / 2;
  let Judg = 0;
  let CW = W / 2;
  let CH = H / 2;
  
  if (CW === x && CH === y) {
    Judg = 1;
  } 

  console.log(S, Judg);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
