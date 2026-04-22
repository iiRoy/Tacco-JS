'use strict';
let execute = input => {
  let inputs = input.split(' ').map(str => +str);
  let ans = 0;
  for (let i = 1; i <= inputs[0]; i++) {
    const sum = String(i).split('').reduce((sum, el) => sum += +el, 0);
    if (sum >= inputs[1] && sum <= inputs[2]) ans += i;
  }
  return ans;
};

function Main(input) {
  console.log(execute(input));
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));