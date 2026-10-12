'use strict';

function calculateStrokes(heightsArray) {
    let accumulatedStrokes = 0;
    let priorHeight = 0;

    for (let currentHeight of heightsArray) {
        if (currentHeight > priorHeight) {
            accumulatedStrokes += (currentHeight - priorHeight);
        }
        priorHeight = currentHeight;
    }

    return accumulatedStrokes;
}

function processInputAndOutput(rawInput) {
    const inputLines = rawInput.split('\n');
    const numberOfElements = parseInt(inputLines[0], 10);
    const heightValues = inputLines[1].split(' ').map(str => parseInt(str, 10));

    const finalResult = calculateStrokes(heightValues);

    console.log(finalResult);
}

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
