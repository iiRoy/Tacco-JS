'use strict';

const calculateIntervalSeparation = (firstCoord, secondCoord, intervalWidth) => {
    const firstIntervalEnd = firstCoord + intervalWidth;
    const secondIntervalEnd = secondCoord + intervalWidth;

    return Math.max(0, firstCoord - secondIntervalEnd, secondCoord - firstIntervalEnd);
};

const executeLogic = (rawInput) => {
    const numericValues = rawInput.trim().split(/\s+/).map(Number);

    const widthVal = numericValues[0];
    const coordA = numericValues[1];
    const coordB = numericValues[2];

    const separationResult = calculateIntervalSeparation(coordA, coordB, widthVal);

    console.log(separationResult);
};

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf-8'));
