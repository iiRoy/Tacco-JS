const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const allInputRows = fileContent.trim().split('\n');

let processingIndex = 0;
const collectedOutputs = [];

while (processingIndex < allInputRows.length) {
    const datasetSizeText = allInputRows[processingIndex];
    const datasetSizeNumber = Number(datasetSizeText);

    if (datasetSizeNumber === 0) {
        break;
    }

    processingIndex++;

    if (processingIndex >= allInputRows.length) {
        // This handles cases where the last line is a dataset size without corresponding numbers.
        // The original code might behave unexpectedly or crash here depending on the exact input.
        // Assuming a graceful exit in such malformed input scenarios.
        break;
    }

    const numericValuesText = allInputRows[processingIndex];
    const numericValuesArr = numericValuesText.split(' ').map(Number);

    collectedOutputs.push(retrieveSmallestDifference(numericValuesArr, datasetSizeNumber));

    processingIndex++;
}

collectedOutputs.forEach(result => console.log(result));

function retrieveSmallestDifference(valueCollection, segmentCount) {
    // Replicate original behavior: if segmentCount is less than 2,
    // the original `diff` variable would remain uninitialized and return `undefined`.
    if (segmentCount < 2) {
        return undefined;
    }

    // Extract the relevant portion of the array as specified by segmentCount
    const relevantPart = valueCollection.slice(0, segmentCount);

    // Sort the extracted segment to simplify finding minimum differences
    relevantPart.sort((alpha, beta) => alpha - beta);

    let minSpan = Infinity;

    // Iterate through the sorted array, comparing only adjacent elements
    for (let idx = 0; idx < relevantPart.length - 1; idx++) {
        const currentSpan = relevantPart[idx + 1] - relevantPart[idx];
        if (currentSpan < minSpan) {
            minSpan = currentSpan;
        }
    }

    return minSpan;
}