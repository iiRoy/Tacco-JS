const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const retrieveAndFormatInput = () => {
    try {
        const rawDataBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
        const processedInputLines = rawDataBuffer.trim().split('\n');
        return processedInputLines;
    } catch (errorReadingInput) {
        console.error(`Error reading input from ${standardInputPath}:`, errorReadingInput.message);
        return [];
    }
};

const executeDataProcessing = () => {
    const processedInputLines = retrieveAndFormatInput();

    if (processedInputLines.length === 0) {
        console.warn("No input data available for processing.");
        return;
    }

    let currentLinePointer = 0;

    while (currentLinePointer < processedInputLines.length) {
        const currentCountString = processedInputLines[currentLinePointer];

        if (currentCountString === '0') {
            break;
        }

        const currentDataSetSize = parseInt(currentCountString, 10);

        if (isNaN(currentDataSetSize) || currentDataSetSize <= 0) {
            console.error(`Invalid or non-positive data set size encountered on line ${currentLinePointer + 1}: '${currentCountString}'. Skipping this block.`);
            currentLinePointer += 2;
            continue;
        }

        currentLinePointer++;

        if (currentLinePointer >= processedInputLines.length) {
            console.error(`Missing numeric values line after count on line ${currentLinePointer}. Terminating processing.`);
            break;
        }

        const numericValuesLine = processedInputLines[currentLinePointer];
        const numericSampleValues = numericValuesLine.split(' ').map(Number);

        if (!Array.isArray(numericSampleValues) || numericSampleValues.some(isNaN)) {
            console.error(`Invalid numeric values found on line ${currentLinePointer + 1}: '${numericValuesLine}'. Skipping this block.`);
            currentLinePointer++;
            continue;
        }

        const resultMinDiff = calculateMinimalDifference(numericSampleValues, currentDataSetSize);
        console.log(resultMinDiff);

        currentLinePointer++;
    }
};

function calculateMinimalDifference(valueCollection, subsetSize) {
    if (!Array.isArray(valueCollection) || valueCollection.length < 2 || subsetSize < 2) {
        return 0;
    }

    let currentMinimumDifference = Infinity;

    for (let outerIndex = 0; outerIndex < subsetSize - 1; outerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < subsetSize; innerIndex++) {
            const absoluteDifference = Math.abs(valueCollection[outerIndex] - valueCollection[innerIndex]);

            if (absoluteDifference < currentMinimumDifference) {
                currentMinimumDifference = absoluteDifference;
            }
        }
    }

    return currentMinimumDifference;
}

executeDataProcessing();