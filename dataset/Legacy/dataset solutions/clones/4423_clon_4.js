'use strict';

function processInputData(sourceText) {
    const lineSegments = sourceText.split('\n');

    const processingResult = lineSegments.reduce((accumulator, currentLine, lineIndex) => {
        if (lineIndex === 0) {
            accumulator.itemCount = Number(currentLine);
        } else if (currentLine.length > 0) {
            accumulator.numericSequence.push(Number(currentLine));
        }
        return accumulator;
    }, { itemCount: 0, numericSequence: [] });

    console.log(processingResult.numericSequence);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
