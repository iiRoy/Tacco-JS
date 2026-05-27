const fileSystemModule = require('fs');

const applicationSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const retrieveFileContent = (filePath, encodingType) => {
    return fileSystemModule.readFileSync(filePath, encodingType);
};

const convertLineToNumbers = (textLine) => {
    const stringValues = textLine.split(' ');
    const numericValues = stringValues.map(val => parseInt(val, 10));
    return numericValues;
};

const fullFileContent = retrieveFileContent(applicationSettings.sourcePath, 'utf-8');
const allInputLines = fullFileContent.split(applicationSettings.lineDelimiter);

const firstDataLineIdentifier = 1;
const secondDataLineIdentifier = 3;

const primaryDataSet = convertLineToNumbers(allInputLines[firstDataLineIdentifier]);
const secondaryDataSet = convertLineToNumbers(allInputLines[secondDataLineIdentifier]);

const calculateIntersectionCount = (collectionA, collectionB) => {
    const matchingElements = collectionB.filter(currentElement => {
        const isElementPresentInA = collectionA.some(comparedElement => currentElement == comparedElement);
        return isElementPresentInA;
    });
    const totalMatches = matchingElements.length;
    return totalMatches;
};

console.log(calculateIntersectionCount(primaryDataSet, secondaryDataSet));
