'use strict';

const getNumericValue = (lineParts, index, radix) => {
    const targetPart = lineParts && lineParts.length > index ? lineParts[index] : undefined;
    return parseInt(targetPart, radix);
};

const executeCalculation = (rawInputContent) => {
    const DECIMAL_RADIX = 10;

    const inputLines = rawInputContent.split('\n');

    const splitLinesBySpace = inputLines.map(line => line.split(' '));

    const firstInputLineParts = splitLinesBySpace[0];
    const secondInputLineParts = splitLinesBySpace[1];

    const valueN = getNumericValue(firstInputLineParts, 0, DECIMAL_RADIX);
    const valueA = getNumericValue(secondInputLineParts, 0, DECIMAL_RADIX);

    const nSquared = valueN * valueN;

    const finalComputedResult = nSquared - valueA;

    console.log(finalComputedResult);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const stdinData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
executeCalculation(stdinData);
