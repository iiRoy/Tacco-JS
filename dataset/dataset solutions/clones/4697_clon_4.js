"use strict";

let inputBuffer = null;
let currentLineIndex = 0;

const primeInputSystem = () => {
    const rawTextContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    inputBuffer = rawTextContent.trim().split("\n");
};

const obtainNextSourceLine = () => {
    if (currentLineIndex >= inputBuffer.length) {
        throw new Error("Input data exhausted.");
    }
    return inputBuffer[currentLineIndex++];
};

const parseTwoIntegers = () => {
    const lineSegments = obtainNextSourceLine().split(" ");
    return [parseInt(lineSegments[0], 10), parseInt(lineSegments[1], 10)];
};

const runComputation = () => {
    primeInputSystem();

    const [firstValue, secondValue] = parseTwoIntegers();

    let computedResult;

    if (secondValue <= (firstValue * 2)) {
        computedResult = Math.floor(secondValue / 2);
    } else {
        computedResult = Math.floor(((firstValue << 1) + secondValue) / 4);
    }

    console.info(computedResult);
};

runComputation();