const appConfig = {
    input: '/dev/stdin',
    newline: '\n'
};

const fileSystem = require('fs');

const inputLines = fileSystem.readFileSync(appConfig.input, 'utf-8').split(appConfig.newline);

const processingState = {
    pond: [],
    stack: []
};

const computePondSegment = (currentPondSegments, segmentStartIdx, segmentEndIdx) => {
    const segmentsAtOrAfterStart = currentPondSegments.filter(segmentInfo => segmentInfo[0] >= segmentStartIdx);
    const segmentsBeforeStart = currentPondSegments.filter(segmentInfo => segmentInfo[0] < segmentStartIdx);

    const accumulatedAreaFromHigherDepths = segmentsAtOrAfterStart
        .map(segmentInfo => segmentInfo[1])
        .reduce((totalAccumulatedArea, segmentArea) => totalAccumulatedArea + segmentArea, 0);

    const currentSegmentLength = segmentEndIdx - segmentStartIdx;
    const totalAreaForNewSegment = accumulatedAreaFromHigherDepths + currentSegmentLength;

    const newSegmentEntry = [segmentStartIdx, totalAreaForNewSegment];

    segmentsBeforeStart.push(newSegmentEntry);

    return segmentsBeforeStart;
};

const finalProcessedData = inputLines[0].split('').reduce((currentStatus, currentChar, currentIndex) => {
    if (currentChar === '\\') {
        currentStatus.stack.push(currentIndex);
    } else if (currentChar === '/') {
        const stackDepth = currentStatus.stack.length;
        if (stackDepth > 0) {
            const segmentStartIdx = currentStatus.stack.pop();
            currentStatus.pond = computePondSegment(currentStatus.pond, segmentStartIdx, currentIndex);
        }
    }
    return currentStatus;
}, processingState);

const totalPondArea = finalProcessedData.pond.reduce((accArea, segmentInfo) => accArea + segmentInfo[1], 0);
const numberOfPonds = finalProcessedData.pond.length;

console.log(totalPondArea);

const pondAreasOutputString = numberOfPonds > 0
    ? ' ' + finalProcessedData.pond.map(segmentInfo => segmentInfo[1].toString()).join(' ')
    : '';

console.log(`${numberOfPonds}${pondAreasOutputString}`);
