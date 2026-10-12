"use strict";
var inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
var inputTokens = inputSource.split(/ |\n/);
var tokenIndex = 0;

var resultValue = processData();
if (resultValue !== undefined) console.log(resultValue);

function processData() {
    let countElements = +inputTokens[tokenIndex++];
    let firstSetRaw = [];
    let secondSetRaw = [];

    for (let currentPosition = 0; currentPosition < countElements; currentPosition++) {
        let numericValue = +inputTokens[tokenIndex++];
        firstSetRaw.push(numericValue + currentPosition);
        secondSetRaw.push(currentPosition - numericValue);
    }

    firstSetRaw.sort((valA, valB) => valA - valB);
    secondSetRaw.sort((valA, valB) => valA - valB);

    function createRunLengths(sortedArray) {
        if (sortedArray.length === 0) return [];
        let encodedSegments = [];
        let currentSegmentValue = sortedArray[0];
        let currentSegmentCount = 0;
        for (let k = 0; k < sortedArray.length; k++) {
            if (sortedArray[k] === currentSegmentValue) {
                currentSegmentCount++;
            } else {
                encodedSegments.push([currentSegmentValue, currentSegmentCount]);
                currentSegmentValue = sortedArray[k];
                currentSegmentCount = 1;
            }
        }
        encodedSegments.push([currentSegmentValue, currentSegmentCount]);
        return encodedSegments;
    }

    let encodedFirst = createRunLengths(firstSetRaw);
    let encodedSecond = createRunLengths(secondSetRaw);

    let firstPointer = 0;
    let secondPointer = 0;
    let finalAccumulator = 0;

    while (firstPointer < encodedFirst.length && secondPointer < encodedSecond.length) {
        let [firstValue, firstCount] = encodedFirst[firstPointer];
        let [secondValue, secondCount] = encodedSecond[secondPointer];

        if (firstValue === secondValue) {
            finalAccumulator += firstCount * secondCount;
            firstPointer++;
            secondPointer++;
        } else if (firstValue < secondValue) {
            firstPointer++;
        } else {
            secondPointer++;
        }
    }

    return finalAccumulator;
}
