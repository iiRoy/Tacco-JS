'use strict'
const main = input => {
  const n = parseInt(input[0], 10), a = input[1].split(' ').map(val => parseInt(val, 10));
  // console.log(n, a);
  for(let i = 0; i < n; i++) {
    let minIndex = a.indexOf(Math.min.apply(null, a));
    console.log(minIndex+1);
    a[minIndex] = 100000;
  }
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));