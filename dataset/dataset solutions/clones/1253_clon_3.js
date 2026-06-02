/// <reference path="node.d.ts" />
/// <reference path="lib.ts" />

function processInputData(dataSegments) {
    let firstSegment = dataSegments.shift();
    let elementCount = Number(firstSegment);

    let numericValues = [];
    let currentIdx = 0;
    while (currentIdx < elementCount) {
        let nextSegment = dataSegments.shift();
        let parsedValue = Number(nextSegment);
        numericValues.push(parsedValue);
        currentIdx++;
    }

    const helpers = mathHelpers;

    let computedResults = [
        helpers.findMinimum(numericValues),
        helpers.findMaximum(numericValues),
        helpers.calculateSum(numericValues)
    ];

    process.stdout.write(computedResults.join(' '));
}

/// <reference path="node.d.ts" />
/// <reference path="main.ts" />

function handleStdinData(inputChunk) {
    const splitData = inputChunk.split(/\s+/);
    processInputData(splitData);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', handleStdinData);

var mathHelpers;
(function (helpers) {
    function findMinimum(inputArray) {
        const mathObj = Math;
        return mathObj.min.apply(mathObj, inputArray);
    }
    helpers.findMinimum = findMinimum;

    function findMaximum(inputArray) {
        const mathObj = Math;
        return mathObj.max.apply(mathObj, inputArray);
    }
    helpers.findMaximum = findMaximum;

    function aggregateArray(inputArray, reducerFunction, initialValue) {
        let accumulator = initialValue;
        for (let arrayIndex = 0; arrayIndex < inputArray.length; ++arrayIndex) {
            let currentElement = inputArray[arrayIndex];
            accumulator = reducerFunction(accumulator, currentElement);
        }
        return accumulator;
    }
    helpers.aggregateArray = aggregateArray;

    function calculateSum(inputArray) {
        let totalSum = 0;
        for (let val of inputArray) {
            totalSum += val;
        }
        return totalSum;
    }
    helpers.calculateSum = calculateSum;
})(mathHelpers || (mathHelpers = {}));
