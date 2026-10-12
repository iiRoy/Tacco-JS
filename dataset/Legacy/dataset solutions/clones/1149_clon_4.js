"use strict";

const rawInput = `6 6
1 0 1 0 1 0
0 1 0 1 0 1
1 0 1 0 1 0
0 1 0 1 0 1
1 0 1 0 1 0
0 1 0 1 0 1`;

let printResult = console.log;

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        processPageContent(rawInput);
    });
}

if (typeof process !== "undefined") {
    let capturedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (segment) {
        capturedData += segment;
    });
    process.stdin.on('end', function () {
        processPageContent(capturedData);
    });
}

function processPageContent(contentPayload) {
    const dataRows = contentPayload.trim().split("\n");
    const dimensions = dataRows.shift().split(" ").map(Number);
    const heightDimension = dimensions[0];
    const widthDimension = dimensions[1];

    const binaryGrid = dataRows.map(rowLine =>
        rowLine.split(" ").map(Number)
    );

    const ultimateArea = calculateMaximumZeroArea(binaryGrid, heightDimension, widthDimension);
    printResult(ultimateArea);
}

function findLargestRectangle(columnHeights) {
    let topValueIndex = 0;
    const stackOfIndices = [];
    let currentMaximal = 0;
    let currentColumn = 0;

    // Add a sentinel zero at the end to correctly flush the stack
    const extendedHeights = columnHeights.concat([0]);

    while (currentColumn < extendedHeights.length) {
        if (stackOfIndices.length === 0 || extendedHeights[stackOfIndices[stackOfIndices.length - 1]] <= extendedHeights[currentColumn]) {
            stackOfIndices.push(currentColumn);
            currentColumn++;
        } else {
            topValueIndex = stackOfIndices.pop();
            const currentHeight = extendedHeights[topValueIndex];
            const widthExtent = stackOfIndices.length === 0 ? currentColumn : currentColumn - stackOfIndices[stackOfIndices.length - 1] - 1;
            const calculatedExtent = currentHeight * widthExtent;
            if (calculatedExtent > currentMaximal) {
                currentMaximal = calculatedExtent;
            }
        }
    }
    return currentMaximal;
}

function calculateMaximumZeroArea(meshData, numRows, numCols) {
    let overallLargest = 0;
    const currentColumnHeights = new Array(numCols);
    for (let c = 0; c < numCols; c++) {
        currentColumnHeights[c] = 0;
    }

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (meshData[r][c] === 0) {
                currentColumnHeights[c]++;
            } else {
                currentColumnHeights[c] = 0;
            }
        }
        const rowLargest = findLargestRectangle(currentColumnHeights);
        if (rowLargest > overallLargest) {
            overallLargest = rowLargest;
        }
    }
    return overallLargest;
}