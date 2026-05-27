'use strict'

const processInputData = (rawData) => {
    const inputLines = rawData.split('\n');

    const parsedLines = inputLines.map(lineContent => {
        const lineSegments = lineContent.split(' ');
        return lineSegments;
    });

    const firstLineSegments = parsedLines[0];
    const numericStringValue = firstLineSegments[0];

    const initialValue = parseInt(numericStringValue, 10);

    const moduloResult = initialValue % 2;
    const calculationFactor = moduloResult + 1;

    const computedOutputValue = initialValue * calculationFactor;

    console.log(computedOutputValue);
}

const fileSystemHandler = require('fs');
const standardInputSource = '/dev/stdin';
const textEncoding = 'utf8';

const fileContentBuffer = fileSystemHandler.readFileSync(standardInputSource, textEncoding);
processInputData(fileContentBuffer);
