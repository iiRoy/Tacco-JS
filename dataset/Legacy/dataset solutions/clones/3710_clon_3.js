'use strict';

const parseInteger = (inputString) => {
    return parseInt(inputString, 10);
};

const transformAndAdjust = (numericStrings) => numericStrings.reduce((accumulatorArray, currentElement, index) => {
    const currentAdjustment = index + 1;
    const adjustedValue = parseInteger(currentElement) - currentAdjustment;
    return [...accumulatorArray, adjustedValue];
}, []);

const calculateTotalDeviation = (originalValues, referencePoint) => originalValues.reduce((totalDeviation, currentValueStr, index) => {
    const requiredOffset = index + 1;
    const targetValue = referencePoint + requiredOffset;
    const currentNumericValue = parseInteger(currentValueStr);
    const absoluteDifference = Math.abs(currentNumericValue - targetValue);
    return totalDeviation + absoluteDifference;
}, 0);

const fileSystemModule = require("fs");
const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInputBuffer.split("\n");

const totalItemCount = parseInteger(inputLines[0]);
const rawNumberStrings = inputLines[1].split(" ");

const adjustedAndSortedNumbers = transformAndAdjust(rawNumberStrings).sort((a, b) => a - b);

const medianElementIndex = Math.floor(totalItemCount / 2);
const calculatedMedianValue = adjustedAndSortedNumbers[medianElementIndex];

const finalSadnessSum = calculateTotalDeviation(rawNumberStrings, calculatedMedianValue);

console.log(finalSadnessSum);
