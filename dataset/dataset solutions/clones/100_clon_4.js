'use strict';

function* numericalSequenceProcessor(dataInput) {
    const contentLines = dataInput.trim().split('\n');
    for (const segment of contentLines) {
        yield Number(segment);
    }
}

const fileSystemAccessor = require('node:fs');
const rawSourceContent = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');

const calculateDerivedValue = (initialValue) => {
    return Math.floor((initialValue * initialValue + 97) / 98) + 1;
};

const processedNumbers = numericalSequenceProcessor(rawSourceContent);

for (const singleMeasurement of processedNumbers) {
    console.log(calculateDerivedValue(singleMeasurement));
}