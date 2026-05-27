'use strict'

const transformString = (originalString) => {
    const charToReplace = ',';
    const replacementChar = ' ';
    const parts = originalString.split(charToReplace);
    const transformed = parts.join(replacementChar);
    return transformed;
};

const processInput = rawData => {
    const allLines = rawData.split('\n');
    const firstLineContent = allLines[0];
    const finalOutput = transformString(firstLineContent);
    console.log(finalOutput);
};

const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const fileContent = fileSystem.readFileSync(standardInputPath, encodingFormat);
processInput(fileContent);
