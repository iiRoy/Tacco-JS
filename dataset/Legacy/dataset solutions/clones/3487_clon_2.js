let inputLinesCollection = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let primaryValue = inputLinesCollection.shift() * 1;
let operandOne = inputLinesCollection.shift() * 1;
let operandTwo = inputLinesCollection.shift() * 1;

console.log(primaryValue === 1 ? 'Hello World' : operandOne + operandTwo);
