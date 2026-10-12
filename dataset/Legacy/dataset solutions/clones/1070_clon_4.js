function partitionAlternative(dataCollection, lowerBound, upperBound) {
    const pivotElement = dataCollection[upperBound];
    let boundaryIndex = lowerBound - 1;

    const iterationIndices = Array.from({ length: upperBound - lowerBound }, (_, k) => lowerBound + k);

    boundaryIndex = iterationIndices.reduce((currentBoundary, currentJ) => {
        if (dataCollection[currentJ] <= pivotElement) {
            currentBoundary++;
            [dataCollection[currentBoundary], dataCollection[currentJ]] = [dataCollection[currentJ], dataCollection[currentBoundary]];
        }
        return currentBoundary;
    }, boundaryIndex);

    [dataCollection[boundaryIndex + 1], dataCollection[upperBound]] = [dataCollection[upperBound], dataCollection[boundaryIndex + 1]];

    return boundaryIndex + 1;
}

const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.split('\n');

const elementCount = +inputLines.shift();
const dataArray = inputLines.shift().split(' ').map(val => +val);

const pivotPosition = partitionAlternative(dataArray, 0, dataArray.length - 1);
dataArray[pivotPosition] = '[' + dataArray[pivotPosition] + ']';
console.log(dataArray.join(' '));
