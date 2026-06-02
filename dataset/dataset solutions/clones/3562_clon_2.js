let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let inputNumber = Number(inputLines.shift());

console.log(
    inputNumber % 2 !== 0
        ? Math.floor(inputNumber / 2) * Math.ceil(inputNumber / 2)
        : Math.pow(inputNumber / 2, 2)
);
