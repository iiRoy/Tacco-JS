let inputLineParts = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split('\n')[0]
  .split(' ');

let firstNumber = inputLineParts.shift() * 1;

let secondNumber = inputLineParts.shift() * 1;

console.log(firstNumber + secondNumber > 24 ? firstNumber + secondNumber - 24 : firstNumber + secondNumber);
