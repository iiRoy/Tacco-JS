'use strict'

function factorialize(num) {
  if (num === 0) { return 1; }
  return num * factorialize(num - 1);
}

function divisor(num) {
  let cnt = 0;
  for (let i = 0; i <= num; i++) {
    if (num % i === 0) {
      cnt += 1;
    }
  }
  return cnt;
}

function Main(input) {
  const num = Number(input);
  const f = factorialize(num);
  console.log(divisor(f));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
