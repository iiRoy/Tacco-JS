"use strict";

const processInputData = (rawText) => {
    const [firstLineContent] = rawText.trim().split("\n");
    const [firstNumber, secondNumber] = firstLineContent.split(" ").map(Number);
    return { upperLimit: firstNumber, thresholdValue: secondNumber };
};

const determineSingleProbability = (currentIterationValue, comparisonThreshold) => {
    if (currentIterationValue >= comparisonThreshold) {
        return 1;
    } else {
        const requiredDoublingSteps = Math.floor(Math.log2(comparisonThreshold / currentIterationValue)) + 1;
        return 0.5 ** requiredDoublingSteps;
    }
};

const performAggregateCalculation = (processedInput) => {
    const { upperLimit: maxCount, thresholdValue: minTarget } = processedInput;
    
    const cumulativeProbability = Array.from({ length: maxCount }, (_, index) => index + 1)
        .reduce((totalAccumulator, currentNumber) => {
            const probabilityForCurrent = determineSingleProbability(currentNumber, minTarget);
            return totalAccumulator + (1 / maxCount) * probabilityForCurrent;
        }, 0);
    
    console.log(cumulativeProbability);
};

const initiateProcess = (inputSource) => {
    const parsedParameters = processInputData(inputSource);
    performAggregateCalculation(parsedParameters);
};

initiateProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));
