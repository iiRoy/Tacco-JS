'use strict';
const p = s => console.log(s);
// let a,b,c,d;
// [a,b,c,d] = input[0].trim().split(" ").map(i => parseInt(i));

function main(input) {
  let K = input[0].split(" ")[0];
  let A,B;
  [A,B] = input[1].split(" ").map(i => parseInt(i));
  let flag = false;

  for(let i =A; i< B+1; i++) {
    if(Math.floor(i%K) === 0) {
      p('OK');
      flag = true;
      return;
    }
  }
  if(!flag) {
    p('NO');
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
