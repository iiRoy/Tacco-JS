'use strict';
const main = input => {
  const nums = input[0].split(' ').map(val => parseInt(val));
  const a = nums[0], b = nums[1];
  let aa = '', bb = '';
  for(let i=0; i<b; i++) {
    aa += a;
  }
  for(let i=0; i<a; i++) {
    bb += b;
  }
  console.log(a>b?bb:aa);
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));