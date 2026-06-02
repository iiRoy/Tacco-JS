"use strict";
const sourceData = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

const [paramAStr, paramBStr] = sourceData[0].split(" ");
const paramA = parseInt(paramAStr);
const paramB = parseInt(paramBStr);

const numericSequence = [];
const rawNumbers = sourceData[1].split(" ");
for (const strNum of rawNumbers) {
    numericSequence.push(parseInt(strNum));
}

const locateSmallestElementPosition = (dataCollection) => {
    let currentMinimumValue = Infinity;
    let currentMinimumIndex = -1;
    let counter = 0;

    for (const elementValue of dataCollection) {
        if (elementValue < currentMinimumValue) {
            currentMinimumValue = elementValue;
            currentMinimumIndex = counter;
        }
        counter++;
    }
    return currentMinimumIndex;
};

const calculateTraversalSteps = (totalElements, groupSize, elementValues) => {
    const targetElementPosition = locateSmallestElementPosition(elementValues);

    const firstSegmentDivisor = groupSize - 1;
    const secondSegmentDivisor = totalElements - groupSize - 1;

    const firstTerm = Math.ceil(targetElementPosition / firstSegmentDivisor);
    const secondTerm = Math.ceil(targetElementPosition / secondSegmentDivisor);

    return firstTerm + secondTerm;
};

console.log(calculateTraversalSteps(paramA, paramB, numericSequence));
