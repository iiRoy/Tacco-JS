'use strict';

function parseAndSortNumbers(lineOfNumbers) {
    const stringTokens = lineOfNumbers.split(' ');
    const parsedNumbers = stringTokens.map(strVal => parseInt(strVal, 10));
    parsedNumbers.sort((firstNum, secondNum) => firstNum - secondNum);
    return parsedNumbers;
}

function computeAdjustedSum(numberList, adjustmentFactor) {
    if (numberList.length === 0) {
        return 0;
    }

    const effectiveMultiplier = 2 * adjustmentFactor;
    const lastElementPosition = numberList.length - 1;

    // Create a working copy to avoid modifying the original array passed as argument
    const mutableNumberList = [...numberList];

    // Apply the modification to the last element
    mutableNumberList[lastElementPosition] = mutableNumberList[lastElementPosition] * effectiveMultiplier;

    let totalAccumulatedSum = 0;
    for (const currentElement of mutableNumberList) {
        totalAccumulatedSum += currentElement;
    }
    return totalAccumulatedSum;
}

function main(programInput) {
    const inputLines = programInput.split('\n');

    const initialNumbers = parseAndSortNumbers(inputLines[0]);
    const factorValue = parseInt(inputLines[1], 10);

    const finalResultSum = computeAdjustedSum(initialNumbers, factorValue);

    console.log(finalResultSum);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
