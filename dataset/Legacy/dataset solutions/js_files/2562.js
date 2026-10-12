'use strict';
const main = input => {
  const n = parseInt(input[0].split(' ')[0], 10);
  const m = parseInt(input[0].split(' ')[1], 10);
  let a = input[1].split(' ').map(val => parseInt(val, 10));
  for(let i=0; i<m; i++) {
    let x = a.indexOf(Math.max.apply(null,a));
    a[x] = Math.floor(a[x]/2);
  }
  console.log(a.reduce((ans, data) => ans + data));
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));