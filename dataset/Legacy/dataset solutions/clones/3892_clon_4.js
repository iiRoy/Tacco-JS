'use strict';

const extractAndConvert = (textSegment) => {
    return Math.trunc(Number(textSegment));
};

const evaluateCondition = (inputString) => {
    const [firstDataLine] = inputString.trim().split('\n');
    const [alpha, beta, gamma] = firstDataLine.split(' ').map(extractAndConvert);

    const delta = gamma - alpha;

    const rangeChecks = [
        () => delta >= 0,
        () => delta <= beta
    ];

    const allChecksPass = rangeChecks.every(check => check());

    console.log(allChecksPass ? 'YES' : 'NO');
};

evaluateCondition(require('fs').readFileSync('/dev/stdin', 'utf8'));
