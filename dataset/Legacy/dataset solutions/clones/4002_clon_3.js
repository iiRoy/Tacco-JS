'use strict'

const processInputData = (rawData) => {
    const rawLines = rawData.split('\n');
    const parsedLines = [];

    for (const lineSegment of rawLines) {
        const tokensInLine = lineSegment.split(' ');
        parsedLines.push(tokensInLine);
    }

    const firstEntryArray = parsedLines[0];
    const targetStringValue = firstEntryArray[0];
    const initialValue = parseInt(targetStringValue, 10);

    const intermediateDivision = initialValue / 3;
    const finalComputedResult = Math.floor(intermediateDivision);

    console.log(finalComputedResult);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileReadEncoding = 'utf8';

const fileContent = fileSystemModule.readFileSync(standardInputPath, fileReadEncoding);

processInputData(fileContent);
