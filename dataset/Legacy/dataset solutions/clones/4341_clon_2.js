var rawData = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split('\n');

let firstNum = parseInt(rawData[0]);
let secondNum = parseInt(rawData[1]);

console.log(firstNum * firstNum - secondNum);
