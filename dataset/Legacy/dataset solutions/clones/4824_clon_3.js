'use strict'

const processInputData = (rawData) => {
    const allInputLines = rawData.split('\n');

    const firstLineContent = allInputLines[0];
    const firstLineParts = firstLineContent.split(' ');
    const heightString = firstLineParts[0];

    const heightValue = parseInt(heightString, 10);

    const relevantDataRows = allInputLines.slice(1, heightValue + 1);

    const outputRowRepeatedly = (rowContent, repeatCount) => {
        for (let i = 0; i < repeatCount; i++) {
            console.log(rowContent);
        }
    };

    const REPETITION_FACTOR = 2;

    for (const currentDataItem of relevantDataRows) {
        outputRowRepeatedly(currentDataItem, REPETITION_FACTOR);
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
