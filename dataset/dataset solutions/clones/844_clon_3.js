const fs = require('fs');

const MAX_ARRAY_BOUND = 100001;
const DEFAULT_INITIAL_COUNT = 1;
const MINIMUM_CHECK_INDEX = 2;

const obtainAndParseInput = () => {
    const rawContent = fs.readFileSync('/dev/stdin', 'utf8');
    const contentLines = rawContent.trim().split('\n');
    const totalRangeOperations = parseInt(contentLines.shift(), 10);
    return { totalRangeOperations, contentLines };
};

const applyRangeUpdates = (startPoint, endPoint, targetCountsArray) => {
    for (let currentPosition = startPoint; currentPosition <= endPoint; currentPosition++) {
        targetCountsArray[currentPosition]++;
    }
};

(() => {
    const { totalRangeOperations, contentLines } = obtainAndParseInput();

    const valueFrequencyTracker = Array.from({ length: MAX_ARRAY_BOUND + 1 }, () => DEFAULT_INITIAL_COUNT);

    for (let operationIndex = 0; operationIndex < totalRangeOperations; operationIndex++) {
        const [rangeStart, rangeEnd] = contentLines.shift().split(' ').map(Number);
        applyRangeUpdates(rangeStart, rangeEnd, valueFrequencyTracker);
    }

    let highestQualifyingIndex = DEFAULT_INITIAL_COUNT;
    for (let currentCheckIndex = MINIMUM_CHECK_INDEX; currentCheckIndex <= MAX_ARRAY_BOUND; currentCheckIndex++) {
        const observedFrequency = valueFrequencyTracker[currentCheckIndex];
        if (observedFrequency >= currentCheckIndex) {
            highestQualifyingIndex = currentCheckIndex;
        }
    }

    console.log(highestQualifyingIndex - 1);
})();
