const fileSystemModule = require('fs');

const rawInputContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let inputLineArray = rawInputContentBuffer.trim().split('\n');

if (inputLineArray.length === 0 || inputLineArray[0].trim() === '') {
    console.error("Error: Input stream is empty or contains only whitespace.");
    process.exit(1);
}

const numberOfProcessingIterations = parseInt(inputLineArray.shift(), 10);

if (isNaN(numberOfProcessingIterations) || numberOfProcessingIterations < 0) {
    console.error("Error: Invalid number of iterations specified in the input.");
    process.exit(1);
}

for (let currentIteration = 0; currentIteration < numberOfProcessingIterations; ++currentIteration) {
    const nkSpecificationLine = inputLineArray.shift();

    if (!nkSpecificationLine) {
        console.error(`Warning: Input ended unexpectedly before iteration ${currentIteration + 1}. Skipping remaining iterations.`);
        break;
    }

    const [elementCountN, segmentCountK] = nkSpecificationLine.split(' ').map(str => parseInt(str, 10));

    if (isNaN(elementCountN) || isNaN(segmentCountK) || elementCountN < 1 || segmentCountK < 1) {
        console.error(`Warning: Invalid N or K values for iteration ${currentIteration + 1}. Skipping this iteration.`);
        continue;
    }

    const coordinateSequenceLine = inputLineArray.shift();

    if (!coordinateSequenceLine) {
        console.error(`Warning: Input ended unexpectedly, missing coordinate sequence for iteration ${currentIteration + 1}. Skipping remaining iterations.`);
        break;
    }

    const numericalCoordinates = coordinateSequenceLine.split(' ').map(str => parseInt(str, 10));

    if (numericalCoordinates.length !== elementCountN) {
        console.error(`Warning: Mismatch between declared N (${elementCountN}) and actual coordinate count (${numericalCoordinates.length}) for iteration ${currentIteration + 1}. Skipping this iteration.`);
        continue;
    }
    if (numericalCoordinates.some(coord => isNaN(coord))) {
        console.error(`Warning: Non-numeric coordinate values detected for iteration ${currentIteration + 1}. Skipping this iteration.`);
        continue;
    }

    const overallCoordinateSpan = numericalCoordinates[numericalCoordinates.length - 1] - numericalCoordinates[0];

    const adjacentGaps = Array.from({ length: numericalCoordinates.length - 1 }, (_, idx) =>
        numericalCoordinates[idx + 1] - numericalCoordinates[idx]
    );

    adjacentGaps.sort((gapA, gapB) => gapB - gapA);

    let cumulativeLargestGapSum = 0;

    const gapsToRemoveCount = Math.min(segmentCountK - 1, adjacentGaps.length);

    if (gapsToRemoveCount > 0) {
        cumulativeLargestGapSum = adjacentGaps.slice(0, gapsToRemoveCount).reduce((total, currentGapValue) => total + currentGapValue, 0);
    }

    const minimizedSegmentTotalLength = overallCoordinateSpan - cumulativeLargestGapSum;

    console.log(minimizedSegmentTotalLength);
}