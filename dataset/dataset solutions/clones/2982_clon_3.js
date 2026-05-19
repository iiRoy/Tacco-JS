'use strict';

function ProcessInput(rawData) {
    let processedData = rawData.trim();
    let dataSegments = processedData.split(/\s+/);

    let initialCount = Number(dataSegments.shift());
    let stringCollection = dataSegments;

    let countEndsWithA = 0;
    let countStartsWithB = 0;
    let countBothEnds = 0;
    let totalABSubstrings = 0;

    for (let i = 0; i < stringCollection.length; i++) {
        let currentString = stringCollection[i];
        let stringLength = currentString.length;

        if (stringLength > 0) {
            let firstChar = currentString[0];
            let lastChar = currentString[stringLength - 1];

            if (lastChar === 'A') {
                countEndsWithA++;
            }
            if (firstChar === 'B') {
                countStartsWithB++;
            }
            if (firstChar === 'B' && lastChar === 'A') {
                countBothEnds++;
            }
        }

        let splitResult = currentString.split('AB');
        totalABSubstrings += splitResult.length - 1;
    }

    let minimumConnections = Math.min(countEndsWithA, countStartsWithB);

    let isAllBoth = (countBothEnds === countEndsWithA) && (countEndsWithA === countStartsWithB);
    if (isAllBoth) {
        minimumConnections--;
    }

    console.log(totalABSubstrings + minimumConnections);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
