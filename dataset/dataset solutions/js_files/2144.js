"use strict";
function main(input) {
  let kari = input[0].trim().split(" ");
  let n = parseInt(kari[0]);
  let a = parseInt(kari[1]);
  let b = parseInt(kari[2]);

  let bunbo = 1;
  let bunshi = 1;

  let kumi = [];
  let sum = 0;

  for(let i=1;i<n+1;i++){
    bunshi *=  (n+1-i);
    bunbo *= i;
    kumi[i-1] = bunshi / bunbo;
    sum += kumi[i-1];
  }

  sum -= kumi[a-1]; 

  sum -= kumi[b-1]; 

  console.log(sum%(Math.pow(10,9)+7));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));