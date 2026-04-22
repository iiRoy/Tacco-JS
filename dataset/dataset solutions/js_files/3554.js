'use strict';

function Main(input) {
  const N = Number(input.split('\n')[0].split(' ')[0]);
  const X = Number(input.split('\n')[0].split(' ')[1]);
  let list = input.split('\n')[1].split(' ').map(n => Math.abs(Number(n) - X));

  list.sort((a, b) => (a > b ? 1 : -1));

  const gcd = (m, n) => {
    if(n === 0) {
      return m;
    } else {
      return gcd(n, m % n);
    }
  }

  if(list.length === 1) {
    console.log(list[0]);
  } else {
    let gcdans = gcd(list[0], list[1]);
    for(let k=2; k<N; k++) {
      gcdans = gcd(gcdans, list[k]);
    }
    console.log(gcdans);
  }


};

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());