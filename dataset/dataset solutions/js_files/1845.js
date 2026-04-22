'use strict';
const p = s => console.log(s);
// let a,b,c,d;
// [a,b,c,d] = input[0].trim().split(" ").map(i => parseInt(i));

function main(input) {
  let N = input[0].trim().split("");

  let num = N.pop();

  if(num == 3) {
    p('bon');
  } else if (num == 0 || num == 1 || num == 6 || num == 8){
    p('pon');
  } else {
    p('hon');
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
