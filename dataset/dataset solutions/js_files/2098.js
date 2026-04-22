function Main(input) {
  'use strict';
  const inp = input.trim().split(' ').map(n=>parseInt(n));
  const divide = Math.floor(inp[0] / (inp[1]+inp[2]));
  const rem = inp[0] % (inp[1]+inp[2]);
  const temp = (inp[1] < rem)?inp[1]:rem;
  console.log(divide*inp[1]+temp)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));