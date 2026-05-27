'use strict';

const sourceInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const calculateAndDisplay = (remainingSegments) => {
    if (remainingSegments.length === 0) {
        return;
    }

    const currentSegment = remainingSegments[0];
    const numericalValue = +currentSegment;
    const computedResult = Math.ceil(Math.pow(numericalValue, 2) / 98 + 1);
    console.log(computedResult);

    calculateAndDisplay(remainingSegments.slice(1));
};

const processedSegments = sourceInput.trim().split('\n');
calculateAndDisplay(processedSegments);
