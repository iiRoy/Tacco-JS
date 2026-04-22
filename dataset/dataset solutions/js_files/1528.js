"use strict";
const main = arg => {
  const [a,b,c,d] = arg.trim().split(' ').map(x => parseInt(x));
  let max = a * c
  if (a * d > max) max = a * d
  if (b * c > max) max = b * c
  if (b * d > max) max = b * d
  console.log(max.toString())
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));