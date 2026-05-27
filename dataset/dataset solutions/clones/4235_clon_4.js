'use strict';

const processInputData = rawData => {
    const numericValues = rawData.split('\n')[0].split(' ').map(Number);
    const firstNum = numericValues[0];
    const secondNum = numericValues[1];
    const thirdNum = numericValues[2];

    const initialCost = secondNum + thirdNum * 2;
    const recurringCost = secondNum + thirdNum;

    if (firstNum <= initialCost) {
        console.log(0);
    } else {
        let remainingValue = firstNum - initialCost;
        let iterationCounter = 0;

        while (remainingValue >= recurringCost) {
            remainingValue -= recurringCost;
            iterationCounter++;
        }
        console.log(iterationCounter + 1);
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
