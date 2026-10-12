'use strict';

function processInputAndCalculate(inputData) {
    const firstDataLine = inputData.split('\n')[0];
    const numberStrings = firstDataLine.split(' ');

    const firstNum = Number(numberStrings[0]);
    const secondNum = Number(numberStrings[1]);
    const thirdNum = Number(numberStrings[2]);

    const totalNumericSum = firstNum + secondNum + thirdNum;

    let currentHighest = firstNum;
    if (secondNum > currentHighest) {
        currentHighest = secondNum;
    }
    if (thirdNum > currentHighest) {
        currentHighest = thirdNum;
    }

    let requiredTargetValue = currentHighest;
    if ((requiredTargetValue % 2) !== (totalNumericSum % 2)) {
        requiredTargetValue++;
    }

    const operationCount = (3 * requiredTargetValue - totalNumericSum) / 2;

    console.log(operationCount);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
