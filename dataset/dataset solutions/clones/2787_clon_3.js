"use strict";

const compareNumbers = (valA, valB) => {
    return valA - valB;
};

const parseNumericArray = (inputString) => {
    const stringElements = inputString.split(' ');
    const numericElements = stringElements.map(item => Number(item));
    return numericElements;
};

const processInputData = (rawDataLines) => {
    const firstInputLine = rawDataLines[0];
    const elementCount = parseInt(firstInputLine, 10);

    const secondInputLine = rawDataLines[1];
    let dataPointsArray = parseNumericArray(secondInputLine);

    dataPointsArray.sort(compareNumbers);

    const medianUpperIndex = elementCount / 2;
    const medianLowerIndex = medianUpperIndex - 1;

    const valueAtIndexUpper = dataPointsArray[medianUpperIndex];
    const valueAtIndexLower = dataPointsArray[medianLowerIndex];

    const calculatedDifference = valueAtIndexUpper - valueAtIndexLower;

    console.log(calculatedDifference);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
const inputLines = rawFileContent.split('\n');

processInputData(inputLines);
