"use strict"
function Main(input) {
  input = input.trim().split(' ').map(Number);
  let A = input[0];
  let B = input[1];
  let C = input[2];
  let X = input[3];
  let Y = input[4];

  let ret = A*X + B*Y;
  if(A + B < 2*C) {
    console.log(ret);
    return;
  }


  const Xmax = X*2;
  const Ymax = Y*2;
  for(let i=1; i<=Xmax; i++){
    if(i%2 !== 0) continue;
    let x = X-i/2 > 0 ? X-i/2 : 0;
    let y = Y-i/2 > 0 ? Y-i/2 : 0;
    let m = C*i + x*A + y*B;
    if(ret > m) ret = m;
  }

  for(let i=1; i<=Ymax; i++){
    if(i%2 !== 0) continue;
    let x = X-i/2 > 0 ? X-i/2 : 0;
    let y = Y-i/2 > 0 ? Y-i/2 : 0;
    let m = C*i + x*A + y*B;
    if(ret > m) ret = m;
  }
  console.log(ret);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));