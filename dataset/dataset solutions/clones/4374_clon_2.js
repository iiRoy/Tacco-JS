'use strict';

const processInput = (rawData) => {
    const parsedLines = rawData.split('\n').map(lineStr => lineStr.split(' '));

    const initialValue = parseInt(parsedLines[0][0], 10);
    const decrementAmount = parseInt(parsedLines[0][1], 10);

    console.log(Math.max(0, initialValue - decrementAmount));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
