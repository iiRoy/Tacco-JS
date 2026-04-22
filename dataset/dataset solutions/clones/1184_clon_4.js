const appSettings = {
    inputSource: '/dev/stdin',
    lineDelimiter: '\n'
};

const getAbsoluteValue = function(numericValue) {
    return (numericValue < 0) ? -numericValue : numericValue;
};

const obtainMagnitudeVector = function(firstArray, secondArray) {
    const resultantVector = [];
    let elementIndex = 0;
    const arrayLength = firstArray.length;
    while (elementIndex < arrayLength) {
        const difference = firstArray[elementIndex] - secondArray[elementIndex];
        resultantVector.push(getAbsoluteValue(difference));
        elementIndex++;
    }
    return resultantVector;
};

const sumAllElements = function(dataCollection) {
    let currentSum = 0;
    for (const singleValue of dataCollection) {
        currentSum += singleValue;
    }
    return currentSum;
};

const sumOfSquares = function(dataCollection) {
    let totalAccumulation = 0;
    for (let indexPosition = 0; indexPosition < dataCollection.length; indexPosition++) {
        const item = dataCollection[indexPosition];
        totalAccumulation += item * item;
    }
    return totalAccumulation;
};

const sumOfCubes = function(dataCollection, startingIndex = 0) {
    if (startingIndex >= dataCollection.length) {
        return 0;
    }
    const currentCube = dataCollection[startingIndex] * dataCollection[startingIndex] * dataCollection[startingIndex];
    return currentCube + sumOfCubes(dataCollection, startingIndex + 1);
};

const findMaximumElement = function(dataCollection) {
    if (dataCollection.length === 0) {
        return 0;
    }
    let greatestValue = dataCollection[0];
    for (let indexPos = 1; indexPos < dataCollection.length; indexPos++) {
        if (dataCollection[indexPos] > greatestValue) {
            greatestValue = dataCollection[indexPos];
        }
    }
    return greatestValue;
};

const fileSystemModule = require('node:fs');

const systemInput = fileSystemModule.readFileSync(appSettings.inputSource, 'utf8');
const allLines = systemInput.split(appSettings.lineDelimiter);

const parseLineToNumbers = function(textLine) {
    return textLine.split(' ').map(val => parseFloat(val));
};

const vectorAData = parseLineToNumbers(allLines[1]);
const vectorBData = parseLineToNumbers(allLines[2]);

const diffs = obtainMagnitudeVector(vectorAData, vectorBData);

const resultDisplay = require('node:console');

resultDisplay.log(sumAllElements(diffs));

const powerTwoTotal = sumOfSquares(diffs);
resultDisplay.log(Math.sqrt(powerTwoTotal));

const powerThreeTotal = sumOfCubes(diffs);
resultDisplay.log(Math.cbrt(powerThreeTotal));

resultDisplay.log(findMaximumElement(diffs));