const getRawInputContent = (pathReference, encodingFormat) => {
    const fileSystemModule = require('fs');
    return fileSystemModule.readFileSync(pathReference, encodingFormat);
};

const convertHourMinuteToMilliseconds = (timeDescriptor) => {
    const commonEpochDate = '2000-01-01 ';
    return Number(new Date(commonEpochDate + timeDescriptor));
};

const displayResult = (finalValue) => {
    console.log(finalValue);
};

const inputSourceIdentifier = '/dev/stdin';
const characterEncodingScheme = 'utf8';

const fullInputContent = getRawInputContent(inputSourceIdentifier, characterEncodingScheme);

let inputLineSegments = fullInputContent.split('\n');

let currentProcessedLine = null;

while ((currentProcessedLine = inputLineSegments.shift()) !== undefined) {
    const cleanedLine = currentProcessedLine.trim();

    if (cleanedLine === '') {
        continue;
    }

    const numberOfIntervalsInBlock = parseInt(cleanedLine, 10);

    if (numberOfIntervalsInBlock === 0) {
        break;
    }

    const currentBlockIntervals = [];

    for (let intervalReadIndex = 0; intervalReadIndex < numberOfIntervalsInBlock; intervalReadIndex++) {
        const intervalTextLine = inputLineSegments.shift();

        if (intervalTextLine === undefined) {
            currentBlockIntervals.length = 0;
            break;
        }

        const timeValueComponents = intervalTextLine.split(' ').map(convertHourMinuteToMilliseconds);
        currentBlockIntervals.push(timeValueComponents);
    }

    if (currentBlockIntervals.length === 0 && numberOfIntervalsInBlock > 0) {
        continue;
    }

    let peakSimultaneousOccurrences = 1;

    for (let primaryIntervalIterator = 0; primaryIntervalIterator < currentBlockIntervals.length; primaryIntervalIterator++) {
        let focalInterval = currentBlockIntervals[primaryIntervalIterator];

        if (focalInterval === null) {
            continue;
        }

        let currentOverlapCount = 1;
        const indicesMarkedForExclusion = [];

        for (let secondaryIntervalIterator = primaryIntervalIterator + 1; secondaryIntervalIterator < currentBlockIntervals.length; secondaryIntervalIterator++) {
            let comparativeInterval = currentBlockIntervals[secondaryIntervalIterator];

            if (comparativeInterval === null) {
                continue;
            }

            const focalEndMoment = focalInterval[1];
            const comparativeStartMoment = comparativeInterval[0];
            const focalStartMoment = focalInterval[0];

            if (focalEndMoment > comparativeStartMoment && comparativeStartMoment > focalStartMoment) {
                indicesMarkedForExclusion.push(secondaryIntervalIterator);
                currentOverlapCount++;
            }
        }

        for (const indexToNullify of indicesMarkedForExclusion) {
            if (indexToNullify < currentBlockIntervals.length) {
                currentBlockIntervals[indexToNullify] = null;
            }
        }

        const compactedIntervalCollection = currentBlockIntervals.filter(
            (elementConsidered) => elementConsidered !== null
        );
        currentBlockIntervals = compactedIntervalCollection;

        peakSimultaneousOccurrences = Math.max(peakSimultaneousOccurrences, currentOverlapCount);
    }

    displayResult(peakSimultaneousOccurrences);
}