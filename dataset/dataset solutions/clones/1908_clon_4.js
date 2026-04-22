"use strict";
var dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = dataStream.split(/ |\n/);
var tokenIndex = 0;

var finalResult = calculateMatchingPairs();
if (finalResult !== undefined) console.log(finalResult);

function calculateMatchingPairs() {
    let elementCount = +tokenArray.shift();
    
    const firstValueCounts = new Map();
    const secondValueCounts = new Map();

    for (let currentPosition = 0; currentPosition < elementCount; ++currentPosition) {
        let originalValue = +tokenArray[currentPosition];
        
        let transformationOne = originalValue + currentPosition;
        firstValueCounts.set(transformationOne, (firstValueCounts.get(transformationOne) || 0) + 1);
        
        let transformationTwo = currentPosition - originalValue;
        secondValueCounts.set(transformationTwo, (secondValueCounts.get(transformationTwo) || 0) + 1);
    }

    let accumulatedSum = 0;

    for (let [value, countInFirst] of firstValueCounts) {
        if (secondValueCounts.has(value)) {
            let countInSecond = secondValueCounts.get(value);
            accumulatedSum += countInFirst * countInSecond;
        }
    }

    return accumulatedSum;
}