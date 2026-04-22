'use strict';
function main(input) {
  const arr = input.trim().split(' ');
  const minimum = Number(Math.min(arr[0], arr[1]));
  const maximum = Number(Math.min(arr[0], arr[1]));
  let str = '';

  for (let i = 0; i < (maximum + 1); i ++) {
    str += String(minimum);
  }

  console.log(str);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));