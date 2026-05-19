"use strict";

const processInput = inputData => {
    inputData = inputData.trim().split("\n");
    const countElements = parseInt(inputData[0]);
    const dataArray = inputData[1].split(" ").map(numStr => parseInt(numStr));

    let currentSum = dataArray[0];
    let operationCount = 0;

    for (let idx = 1; idx < countElements; idx++) {
        // Adjust the current element if the running sum is non-negative and adding it keeps it non-negative.
        while (currentSum >= 0 && currentSum + dataArray[idx] >= 0) {
            dataArray[idx]--;
            operationCount++;
        }

        // Adjust the current element if the running sum is non-positive and adding it keeps it non-positive.
        while (currentSum <= 0 && currentSum + dataArray[idx] <= 0) {
            dataArray[idx]++;
            operationCount++;
        }

        currentSum += dataArray[idx];
    }

    console.log(operationCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
