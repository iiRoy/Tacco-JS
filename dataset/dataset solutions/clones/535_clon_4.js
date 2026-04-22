const inputSource = require('fs');
const incomingText = inputSource.readFileSync('/dev/stdin', 'utf8');

const numericOperands = incomingText.trim().split(' ').reduce((accumulator, currentSegment, indexPosition) => {
    if (indexPosition < 2) {
        accumulator.push(Number(currentSegment));
    }
    return accumulator;
}, []);

const operandOne = numericOperands[0];
const operandTwo = numericOperands[1];

const calculatedMean = operandOne + (operandTwo - operandOne) / 2;

console.log(calculatedMean);