'use strict'

const executeSolution = (sourceData) => {
    const primaryString = sourceData.split('\n')[0].split(' ')[0];
    const detectionRegex = /AC/;
    const presenceConfirmed = detectionRegex.test(primaryString);
    console.log(presenceConfirmed ? 'Yes' : 'No');
};

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
