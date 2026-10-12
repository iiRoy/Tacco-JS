const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const firstInputValue = Number(inputDataLines.shift());
const secondInputValue = Number(inputDataLines.shift());
const thirdInputValue = Number(inputDataLines.shift());

const sumOfSecondAndThird = secondInputValue + thirdInputValue;

let finalOutputContent;
if (firstInputValue === 1) {
    finalOutputContent = 'Hello World';
} else {
    finalOutputContent = sumOfSecondAndThird;
}

console.log(finalOutputContent);
