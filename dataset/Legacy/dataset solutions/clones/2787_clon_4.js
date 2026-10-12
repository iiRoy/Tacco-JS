"use strict";
const processInput = (rawDataLines) => {
    const elementCount = +rawDataLines[0];
    let numericalValues = rawDataLines[1].split(' ').map(strVal => parseFloat(strVal));

    for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
        let currentElement = numericalValues[currentIdx];
        let previousIdx = currentIdx - 1;
        while (previousIdx >= 0 && numericalValues[previousIdx] > currentElement) {
            numericalValues[previousIdx + 1] = numericalValues[previousIdx];
            previousIdx--;
        }
        numericalValues[previousIdx + 1] = currentElement;
    }

    const upperMiddleIndex = elementCount / 2;
    const lowerMiddleIndex = upperMiddleIndex - 1;

    const secondMiddleValue = numericalValues[upperMiddleIndex];
    const firstMiddleValue = numericalValues[lowerMiddleIndex];

    console.log(secondMiddleValue - firstMiddleValue);
};

const executeProgram = () => {
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const inputLines = inputContent.split('\n');
    processInput(inputLines);
};

executeProgram();
