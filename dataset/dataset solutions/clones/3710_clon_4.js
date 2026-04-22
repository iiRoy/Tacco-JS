'use strict';

const adjustAndCollect = (inputArrayOfStrings) => {
    let resultContainer = [];
    for (let i = 0; i < inputArrayOfStrings.length; i++) {
        let numericalValue = Number(inputArrayOfStrings[i]);
        resultContainer.push(numericalValue - (i + 1));
    }
    return resultContainer;
};

const computeDiscrepancySum = (sourceDataStrings, referencePoint) => {
    let totalDiscrepancy = 0;
    for (let j = 0; j < sourceDataStrings.length; j++) {
        let currentNumber = Number(sourceDataStrings[j]);
        totalDiscrepancy += Math.abs(currentNumber - (referencePoint + j + 1));
    }
    return totalDiscrepancy;
};

const fileSystem = require("fs");
const rawContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const lines = rawContent.split("\n");

const elementCount = Number(lines[0]);
const initialStringValues = lines[1].split(" ");

let modifiedNumericValues = adjustAndCollect(initialStringValues);

const numericalOrder = (valA, valB) => {
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
};
modifiedNumericValues.sort(numericalOrder);

const centralIndex = Math.floor(elementCount / 2);
const derivedCentralValue = modifiedNumericValues[centralIndex];

const finalResult = computeDiscrepancySum(initialStringValues, derivedCentralValue);

console.log(finalResult);