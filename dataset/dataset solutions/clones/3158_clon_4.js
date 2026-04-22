"use strict";

const processInput = rawData => {
    const inputSequence = rawData.split("\n")[0];
    
    const counts = [...inputSequence].reduce((acc, char) => {
        if (char === '0') {
            acc.zeros++;
        } else if (char === '1') {
            acc.ones++;
        }
        return acc;
    }, { zeros: 0, ones: 0 });

    const cancellablePairs = 2 * Math.min(counts.zeros, counts.ones);
    
    console.log(cancellablePairs);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));