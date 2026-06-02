var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputTokens = inputSource.trim().split(' ');

const operationDispatch = {
    '+': (firstVal, secondVal) => firstVal + secondVal,
    '-': (firstVal, secondVal) => firstVal - secondVal,
    '*': (firstVal, secondVal) => firstVal * secondVal,
};

const finalResultStack = inputTokens.reduce((currentAccumulator, currentElement) => {
    if (operationDispatch[currentElement]) {
        const operandTwo = currentAccumulator.pop();
        const operandOne = currentAccumulator.pop();
        currentAccumulator.push(operationDispatch[currentElement](operandOne, operandTwo));
    } else {
        currentAccumulator.push(Number.parseInt(currentElement, 10));
    }
    return currentAccumulator;
}, []);

console.log(finalResultStack[0]);
