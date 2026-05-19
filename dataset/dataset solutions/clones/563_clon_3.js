function calculateMaxSum(inputArray, windowSizeParam) {
    const fixedWindowSize = 3;
    const windowSums = [];

    for (let idx = 0; idx < inputArray.length - fixedWindowSize; idx++) {
        const currentWindowSum = inputArray[idx] + inputArray[idx + 1] + inputArray[idx + 2];
        windowSums.push(currentWindowSum);
    }

    windowSums.sort((valA, valB) => valB - valA);
    console.log(windowSums[0]);
}

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

let currentDataArray = [];
let currentWindowSize = 0;
let hasPreviousBlockData = false; // Tracks if a block of data has been accumulated before the current line

function parseLineToNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentLineString = inputLines[lineIndex];

    if (currentLineString === "0 0") {
        break;
    }

    const parsedLine = parseLineToNumbers(currentLineString);

    const isBlockDelimiterLine = (parsedLine.length === 2);
    const isLastLineOfInput = (lineIndex === inputLines.length - 1);

    if (isBlockDelimiterLine || isLastLineOfInput) {
        // If this is not the very first block of data, process the previously accumulated data
        if (hasPreviousBlockData) {
            calculateMaxSum(currentDataArray, currentWindowSize);
        }

        // Reset for the new block of data
        currentDataArray = [];
        currentWindowSize = Number(parsedLine[1]); // Explicit type conversion

        // Mark that we've now processed at least one block delimiter
        hasPreviousBlockData = true;
    } else {
        // This is a data point line
        currentDataArray.push(parsedLine[0]);
    }
}
