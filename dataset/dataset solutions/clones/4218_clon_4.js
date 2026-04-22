"use strict";

const termCache = new Map();

const calculateSequenceTerm = (position) => {
    if (termCache.has(position)) {
        return termCache.get(position);
    }

    let currentTerm;
    if (position === 0) {
        currentTerm = 2;
    } else if (position === 1) {
        currentTerm = 1;
    } else {
        currentTerm = calculateSequenceTerm(position - 1) + calculateSequenceTerm(position - 2);
    }

    termCache.set(position, currentTerm);
    return currentTerm;
};

const processExternalInput = (rawData) => {
    const requestedPosition = parseInt(rawData.split('\n')[0], 10);
    console.log(calculateSequenceTerm(requestedPosition));
};

processExternalInput(require('fs').readFileSync('/dev/stdin', 'utf8'));