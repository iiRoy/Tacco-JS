'use strict'

function Main(input) {
  const inputs = input.split('\r\n');
  const numbers = inputs.slice(1);
  
  const paper = {};
  let sum = 0;
  numbers.map(n => {
    if (paper[n] === true) {
      paper[n] = false;
      sum -= 1;
    } else {
      paper[n] = true;
      sum += 1;
    }
  });
  console.log(sum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
