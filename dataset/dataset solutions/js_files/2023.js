"use strict";

const main = arg => {
  
    const input = arg.trim();

    const N = parseInt(input[0]);
    var big = N / 500;
    var small = (N - big * 500) / 5;
    console.log(big*1000 + small * 5);
  
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));