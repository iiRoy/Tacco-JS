'use strict';

const calculateProfileStrokes = (inputDataBlob) => {
    const profileLines = inputDataBlob.split('\n');
    const altitudeValues = profileLines[1].split(' ').map(Number);

    const finalState = altitudeValues.reduce((accumulator, currentAltitude) => {
        let newStrokeCount = accumulator.totalStrokes;
        if (currentAltitude > accumulator.surfaceLevel) {
            newStrokeCount += (currentAltitude - accumulator.surfaceLevel);
        }
        return { totalStrokes: newStrokeCount, surfaceLevel: currentAltitude };
    }, { totalStrokes: 0, surfaceLevel: 0 });

    return finalState.totalStrokes;
};

(() => {
    const rawContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const resultingValue = calculateProfileStrokes(rawContent);
    console.log(resultingValue);
})();