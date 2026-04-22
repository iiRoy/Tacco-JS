const fileSystemAccessor = require('node:fs');

const extractSegments = (sourceContent) => {
    const collectedSegments = [];
    let currentSegmentAccumulator = [];
    for (let charPointer = 0; charPointer < sourceContent.length; charPointer++) {
        const currentCharacter = sourceContent[charPointer];
        if (currentCharacter === '\n') {
            collectedSegments.push(currentSegmentAccumulator.join(''));
            currentSegmentAccumulator = [];
        } else {
            currentSegmentAccumulator.push(currentCharacter);
        }
    }
    collectedSegments.push(currentSegmentAccumulator.join(''));
    return collectedSegments;
};

const rawDataBuffer = fileSystemAccessor.readFileSync('/dev/stdin');
const completeTextValue = rawDataBuffer.toString('utf8');

const processedLines = extractSegments(completeTextValue);

const preparedOutputs = processedLines.map((segmentValue, segmentIndex) => {
    const sequenceNumber = segmentIndex + 1;
    return `Sequence ${sequenceNumber}:${segmentValue}`;
});

preparedOutputs.forEach(outputLine => {
    process.stdout.write(outputLine + '\n');
});