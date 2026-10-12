'use strict';
const main = input => {
  const n = parseInt(input[0]);
  let x = new Array(n), y = new Array(n);
  for(let i=0; i<n; i++) {
    let k = input[i+1].split(' ').map(val => parseInt(val));
    x[i] = k[0], y[i] = k[1];
  }
  // console.log(n, x, y);
  let distanceSum = 0;
  for(let i=0; i<n-1; i++) {
    for(let j=i; j<n; j++) {
      distanceSum += Math.sqrt((x[i]-x[j])*(x[i]-x[j])+(y[i]-y[j])*(y[i]-y[j]));
    }
  }
  // console.log(distanceSum);
  console.log(distanceSum/n*2);
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));