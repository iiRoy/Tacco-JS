'use strict';

const ioHandler = require('fs');

const computeMinimumSum = () => {
    const dataStream = ioHandler.readFileSync('/dev/stdin', 'utf8');
    const parsedNumbers = dataStream.split(/\s/).map(Number);

    return Math.min(parsedNumbers[0], parsedNumbers[1]) + Math.min(parsedNumbers[2], parsedNumbers[3]);
};

console.log(computeMinimumSum());
