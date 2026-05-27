"use strict";

function parseRangeBounds(lineString) {
    const parts = lineString.split(" ");
    const startValue = parseInt(parts[0], 10);
    const endValue = parseInt(parts[1], 10);
    return { start: startValue, end: endValue };
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const configLineParts = inputLines[0].split(" ");
    const totalItems = parseInt(configLineParts[0], 10);
    const numRanges = parseInt(configLineParts[1], 10);

    const initialRange = parseRangeBounds(inputLines[1]);
    let currentMinBound = initialRange.start;
    let currentMaxBound = initialRange.end;

    for (let rangeIndex = 2; rangeIndex <= numRanges; rangeIndex++) {
        const currentRange = parseRangeBounds(inputLines[rangeIndex]);
        const currentRangeStart = currentRange.start;
        const currentRangeEnd = currentRange.end;

        const potentialNewMin = Math.max(currentMinBound, currentRangeStart);
        const potentialNewMax = Math.min(currentMaxBound, currentRangeEnd);

        if (potentialNewMin > potentialNewMax) {
            currentMinBound = 0;
            currentMaxBound = -1;
            break;
        } else {
            currentMinBound = potentialNewMin;
            currentMaxBound = potentialNewMax;
        }
    }

    const intersectionLength = currentMaxBound - currentMinBound + 1;
    console.log(intersectionLength);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
