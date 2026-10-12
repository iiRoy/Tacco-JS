'use strict';

let rawDataBuffer = '';
let lineIndex = 0;

function setupInputStream() {
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', chunk => {
        rawDataBuffer += chunk;
    });

    process.stdin.on('end', () => {
        rawDataBuffer = rawDataBuffer.trim().split('\n').map(line => line.trim());
        executeProgram();
    });
}

function fetchLine() {
    return rawDataBuffer[lineIndex++];
}

function parseNumArray(lineContent) {
    return lineContent.split(' ').map(val => Number(val));
}

function parseInteger(lineContent) {
    return Number(lineContent);
}

function parseStringArray(lineContent) {
    return lineContent.split(' ').map(val => val);
}

function calculateAbsoluteDifference(valueA, valueB) {
    return Math.abs(valueA - valueB);
}

function executeProgram() {
    const initialParams = parseNumArray(fetchLine());
    const arrayLength = initialParams[0];
    const maxJump = initialParams[1];
    const inputArray = parseNumArray(fetchLine());

    const minCost = new Array(arrayLength);
    minCost.fill(Number.MAX_SAFE_INTEGER);

    minCost[0] = 0;
    if (arrayLength > 1) {
        minCost[1] = calculateAbsoluteDifference(inputArray[1], inputArray[0]);
    }

    for (let currentIndex = 2; currentIndex < arrayLength; currentIndex++) {
        let currentMinCost = Number.MAX_SAFE_INTEGER;

        for (let jumpOffset = 1; jumpOffset <= maxJump; jumpOffset++) {
            const previousIndex = currentIndex - jumpOffset;

            if (previousIndex >= 0) {
                const costFromPrevious = minCost[previousIndex];
                const jumpCost = calculateAbsoluteDifference(inputArray[currentIndex], inputArray[previousIndex]);
                const totalPathCost = costFromPrevious + jumpCost;

                currentMinCost = Math.min(currentMinCost, totalPathCost);
            }
        }
        minCost[currentIndex] = currentMinCost;
    }

    console.log(minCost[arrayLength - 1]);
}

setupInputStream();
