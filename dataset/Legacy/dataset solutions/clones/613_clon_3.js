const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
const processedInputLines = rawInputContent.trim().split("\n");

const numberOfElements = Number(processedInputLines.shift());

const calculatedSumsCollection = [];

const computeNumericSum = (stringA, stringB) => {
    const numericA = Number(stringA);
    const numericB = Number(stringB);
    return numericA + numericB;
};

for (let primaryIndex = 0; primaryIndex < numberOfElements; primaryIndex++) {
    for (let secondaryIndex = primaryIndex + 1; secondaryIndex < numberOfElements; secondaryIndex++) {
        const currentSum = computeNumericSum(processedInputLines[primaryIndex], processedInputLines[secondaryIndex]);
        calculatedSumsCollection.push(currentSum);
    }
}

calculatedSumsCollection.sort((valueOne, valueTwo) => valueOne - valueTwo);

const desiredResultIndex = 2;
console.log(calculatedSumsCollection[desiredResultIndex]);
