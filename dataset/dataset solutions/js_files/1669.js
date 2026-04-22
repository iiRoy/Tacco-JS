"use strict";

const main = arg => {
  const input = arg.trim();

  const [N, A] = input.split('\n').map(y => y.split(' ').map(x => parseInt(x)));
  let ans = 0;

  for (let i = 1; i <= A.length; i += 2) {
    if (A[i] % 2) { ans++ }
  }

  console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));