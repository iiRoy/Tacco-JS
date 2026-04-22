'use strict'

const processStream = (rawData) => {
    const primarySequence = rawData.split('\n')[0].split(' ')[0];

    const patternMatcher = /AC/;
    const matchFound = patternMatcher.test(primarySequence);

    console.log(matchFound ? 'Yes' : 'No');
};

processStream(require('node:fs').readFileSync('/dev/stdin', 'utf8'));