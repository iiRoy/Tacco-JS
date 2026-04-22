'use strict';
const main = input => {
  const num = input[0].split(' ').map(val => parseInt(val));
  let n = num[0], a = num[1], b = num[2];
  let dist = b-a;
  let l = b-1, r = n-a;
  if (dist%2) {
    console.log(l>r?r:l);
  } else {
    console.log(dist/2);
  }
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));