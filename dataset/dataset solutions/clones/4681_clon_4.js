function processDataEntry(sourceContent) {
    const numericGoal = Number.parseInt(sourceContent[0], 10);

    let minimumCandidate = 1;
    let maximumSearchLimit = 2_000_000_000; // Upper bound for the result 'k'
    let solutionFound = maximumSearchLimit;

    while (minimumCandidate <= maximumSearchLimit) {
        const pivotPoint = Math.floor((minimumCandidate + maximumSearchLimit) / 2);
        const accumulatedSum = pivotPoint * (pivotPoint + 1) / 2;

        if (accumulatedSum >= numericGoal) {
            solutionFound = pivotPoint;
            maximumSearchLimit = pivotPoint - 1;
        } else {
            minimumCandidate = pivotPoint + 1;
        }
    }

    console.info(solutionFound);
}

const fileSystemModule = require('node:fs');
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputBuffer.trim().split('\n');

processDataEntry(processedLines);