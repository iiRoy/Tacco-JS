'use strict';

function processInput(rawText) {
    const lineSegments = rawText.split('\n');
    const encounteredValues = Object.create(null);
    let distinctValueCount = 0;

    for (let currentIdx = 1; currentIdx < lineSegments.length; currentIdx++) {
        const lineContent = lineSegments[currentIdx];
        const numericValue = parseInt(lineContent, 10);

        if (!(numericValue in encounteredValues)) {
            encounteredValues[numericValue] = true;
            distinctValueCount++;
        }
    }

    console.log(distinctValueCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
