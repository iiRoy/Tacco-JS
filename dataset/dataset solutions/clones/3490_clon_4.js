'use strict';

const processInputData = (sourceText) => {
    const lineSegments = sourceText.split('\n');

    const [entryCount, timeThreshold] = lineSegments[0].split(' ').map(Number);

    const initialMinimum = 1001;

    const computedMinimum = lineSegments
        .slice(1, entryCount + 1)
        .reduce((currentMin, dataRow) => {
            const [costValue, durationValue] = dataRow.split(' ').map(Number);
            return (durationValue < timeThreshold && costValue < currentMin) ? costValue : currentMin;
        }, initialMinimum);

    console.log(computedMinimum === initialMinimum ? 'TLE' : computedMinimum);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
