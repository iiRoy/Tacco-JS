"use strict"

function fx(x) {
  if(x==1) return 1;
  return fx(x/2)*2+1
}

function Main(input) {
  input = input.trim();
  let h = Number(input);
  let ans = fx(h);
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));