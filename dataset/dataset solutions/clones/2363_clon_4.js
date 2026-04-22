"use strict";
const obtainInputData = (originPath) => {
    const fullContent = require("node:fs").readFileSync(originPath, "utf8");
    const preparedLines = fullContent.trim().split("\n");
    let currentPosition = 0;

    const retrieveNextNumericLine = () => {
        if (currentPosition >= preparedLines.length) {
            throw new Error("No more input lines available.");
        }
        const lineFragment = preparedLines[currentPosition];
        currentPosition++;
        return lineFragment.split(" ").map(Number);
    };

    return {
        fetchLineNumbers: retrieveNextNumericLine,
    };
};

const performCalculation = () => {
    const dataStream = obtainInputData("/dev/stdin");

    dataStream.fetchLineNumbers();

    const targetSequence = dataStream.fetchLineNumbers();

    const elementOfInterest = targetSequence[1];

    return elementOfInterest === 1 ? 1 : 0;
};

console.log(performCalculation());