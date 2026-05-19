'use strict'

const processDataStream = incomingText => {
    const initialSegment = incomingText.split('\n')[0];
    let transformedSegment = '';
    for (let charIndex = 0; charIndex < initialSegment.length; charIndex++) {
        if (initialSegment[charIndex] === ',') {
            transformedSegment += ' ';
        } else {
            transformedSegment += initialSegment[charIndex];
        }
    }
    console.log(transformedSegment);
};

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));
