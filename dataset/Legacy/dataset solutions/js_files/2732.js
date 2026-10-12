'use strict';
function main(input) {
  const arr = input.trim().split(' ');
  const a = Number(arr[0]);
  const b = Number(arr[1]);
  
  console.log(Math.ceil(a / (b * 2)));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));