"use strict";

const findGreatestCommonDivisor = (valA, valB) => {
    while (valB !== 0) {
        const tempHolder = valB;
        valB = valA % valB;
        valA = tempHolder;
    }
    return valA;
};

const computeCommonDivisorForList = (numList) => {
    return numList.reduce((accumulator, currentVal) =>
        findGreatestCommonDivisor(accumulator, currentVal)
    );
};

const processInputData = (rawData) => {
    const inputLines = rawData.trim().split("\n");
    const [firstLineContent, secondLineContent] = inputLines;

    const [firstParamStr, secondParamStr] = firstLineContent.split(" ");
    const firstParam = Number(firstParamStr);
    const secondParam = Number(secondParamStr);

    const numericValues = secondLineContent.split(" ").map(Number);
    numericValues.sort((elemX, elemY) => elemY - elemX);

    const highestValueInList = numericValues[0];
    const overallDivisorResult = computeCommonDivisorForList(numericValues);

    const canReachTarget = highestValueInList >= secondParam;
    const isDivisibleByGCD = secondParam % overallDivisorResult === 0;

    const finalOutcome = (canReachTarget && isDivisibleByGCD) ? "POSSIBLE" : "IMPOSSIBLE";
    console.log(finalOutcome);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
