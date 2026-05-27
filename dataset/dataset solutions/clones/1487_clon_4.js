"use strict";

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputData.split(/ |\n/);
let tokenPointer = 0;

function obtainNumber() {
    return Number(inputTokens[tokenPointer++]);
}

function obtainNumbers(count) {
    const segment = inputTokens.slice(tokenPointer, tokenPointer + count);
    tokenPointer += count;
    return segment.map(Number);
}

const outputCollector = [];
function emitOutput(content) {
    outputCollector.push(content);
}

function calculateMaxOverlap() {
    const [itemCount, rangeOffset] = obtainNumbers(2);
    const valueArray = obtainNumbers(itemCount);

    const maxCoordinateValue = 300000;
    const overlapChanges = new Array(maxCoordinateValue + 2).fill(0);

    for (let i = 0; i < itemCount; i++) {
        const currentVal = valueArray[i];
        const startPoint = Math.max(0, currentVal - rangeOffset);
        const endPoint = Math.min(maxCoordinateValue, currentVal + rangeOffset);

        overlapChanges[startPoint]++;
        overlapChanges[endPoint + 1]--;
    }

    let currentActiveCount = 0;
    let peakOverlap = 0;

    for (let i = 0; i < itemCount; i++) {
        currentActiveCount += overlapChanges[i];
        peakOverlap = Math.max(peakOverlap, currentActiveCount);
    }

    return peakOverlap;
}

const finalResult = calculateMaxOverlap();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}
if (outputCollector.length > 0) {
    console.log(outputCollector.join("\n"));
}
