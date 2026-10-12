"use strict";

const FIRST_VAL_IDX = 0;
const SECOND_VAL_IDX = 1;
const K_VAL_IDX = 3;
const MAX_ABS_DIFF_THRESHOLD = Math.pow(10, 18);

const determineAdjustedDifference = (initialDifference, kLastDigit) => {
    const isKValueEven = (kLastDigit % 2 === 0);
    const isDifferenceZero = (initialDifference === 0);

    if (isKValueEven || isDifferenceZero) {
        return initialDifference;
    } else {
        return -initialDifference;
    }
};

const processInputData = rawInputString => {
    const inputLines = rawInputString.trim().split("\n");

    const firstNumString = inputLines[FIRST_VAL_IDX];
    const secondNumString = inputLines[SECOND_VAL_IDX];

    const valueA = parseInt(firstNumString);
    const valueB = parseInt(secondNumString);

    const calculatedDifference = valueA - valueB;

    const kLineContent = inputLines[K_VAL_IDX];
    const kLastDigit = parseInt(kLineContent.slice(-1));

    const absoluteDifferenceValue = Math.abs(calculatedDifference);

    if (absoluteDifferenceValue > MAX_ABS_DIFF_THRESHOLD) {
        console.log("Unfair");
    } else {
        const finalResult = determineAdjustedDifference(calculatedDifference, kLastDigit);
        console.log(finalResult);
    }
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContent.trim());
