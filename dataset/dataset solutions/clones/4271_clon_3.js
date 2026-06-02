'use strict'

const processInputData = rawData => {
    const lineSegments = rawData.split('\n');
    const parsedLines = lineSegments.map(segment => segment.split(' '));

    const firstLineParts = parsedLines[0];
    const firstStringValue = firstLineParts[0];
    const firstNumericValue = parseInt(firstStringValue, 10);

    const secondLineParts = parsedLines[1];
    const secondStringValue = secondLineParts[0];
    const secondNumericValue = parseInt(secondStringValue, 10);

    const doubledSecond = secondNumericValue * 2;
    const finalCalculatedResult = doubledSecond - firstNumericValue;

    console.log(finalCalculatedResult);
}

const standardInputFilePath = '/dev/stdin';
const fileSystemUtility = require('fs');
const inputContent = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

processInputData(inputContent);
