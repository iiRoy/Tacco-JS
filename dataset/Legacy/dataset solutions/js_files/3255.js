'use strict';
let fn = val => {
  return val % 2 == 0 ? val / 2 : val * 3 + 1;
};
let execute = input => {
  let val = +input;
  let set = new Set([val]);
  let i = 2;
  while (true) {
    val = fn(val);
    if (set.has(val)) return i;
    set.add(val);
    i++;
  }
};

function Main(input) {
  console.log(execute(input));
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));