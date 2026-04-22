'use strict'

const processTextualData = (fullTextualInput) => {
    const parsedLinesArray = fullTextualInput.trim().split('\n');
    const operationalLines = parsedLinesArray.slice(1);

    const resultantString = operationalLines.reduce((accumulator, currentElement, currentIndex, fullArray) => {
        const doubledLine = currentElement + '\n' + currentElement;
        return accumulator + doubledLine + (currentIndex < fullArray.length - 1 ? '\n' : '');
    }, '');

    return resultantString;
};

const fileSystemInterface = require('node:fs');
const standardInputPath = '/dev/stdin';
const rawDataPayload = fileSystemInterface.readFileSync(standardInputPath, 'utf8');

console.log(processTextualData(rawDataPayload));