'use strict'

const processInputAndDetermine = (rawData) => {
    const [valA, valB, valC] = rawData.match(/-?\d+/g).slice(0, 3).map(Number);

    const isWithinBounds = valC > Math.min(valA, valB) && valC < Math.max(valA, valB);

    console.log(isWithinBounds ? 'Yes' : 'No');
};

processInputAndDetermine(require('fs').readFileSync('/dev/stdin', 'utf8'));
