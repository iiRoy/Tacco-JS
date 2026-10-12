'use strict'

function calculateProbFactor(initialValue, targetThreshold) {
    let currentFactor = 1.0;
    let workingValue = initialValue;
    const doublingFactor = 2.0;

    while (workingValue < targetThreshold) {
        workingValue *= doublingFactor;
        currentFactor /= doublingFactor;
    }
    return currentFactor;
}

function ProcessInput(rawData) {
    const inputParts = rawData.split(" ");
    const limitVal = Number(inputParts[0]);
    const thresholdVal = Number(inputParts[1]);

    let totalProbabilitySum = 0.0;
    const unitIncrement = 1.0;
    const loopStartValue = 1;

    for (let currentNum = loopStartValue; currentNum <= limitVal; currentNum++) {
        if (currentNum >= thresholdVal) {
            totalProbabilitySum += unitIncrement;
        } else {
            const currentProbContribution = calculateProbFactor(currentNum, thresholdVal);
            totalProbabilitySum += currentProbContribution;
        }
    }

    console.log(totalProbabilitySum / limitVal);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
