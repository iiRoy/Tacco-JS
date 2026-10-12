"use strict";

var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var parsedTokens = rawData.split(/ |\n/), tokenIndex = 0;

var finalResult = calculateSolution();
if (finalResult !== undefined) {
    console.log(finalResult);
}

function calculateSolution() {
    // Debugging: console.log(parsedTokens);
    // Alternative parsing: parsedTokens = parsedTokens.map(item => +item);

    let countElements = +parsedTokens.shift();

    let sumMap = {}; // Stores counts for (index + value)
    let diffMap = {}; // Stores counts for (index - value)

    parsedTokens.forEach((currentVal, idx) => {
        let numericValue = +currentVal;
        // Increment count for the sum (index + value)
        sumMap[String(idx + numericValue)] = (sumMap[String(idx + numericValue)] || 0) + 1;
        // Increment count for the difference (index - value)
        diffMap[String(idx - numericValue)] = (diffMap[String(idx - numericValue)] || 0) + 1;
    });

    // Debugging: console.log({ sumMap, diffMap });

    let sumKeys = Object.keys(sumMap);
    let totalPairs = 0;

    // Iterate through keys present in sumMap that are also present in diffMap
    sumKeys.filter(keyStr => diffMap[keyStr]).forEach(keyStr => {
        // Add the product of counts for matching keys
        totalPairs += (sumMap[keyStr] * diffMap[keyStr]);
        // Debugging: console.log(keyStr, sumMap[keyStr], diffMap[keyStr]);
    });

    return totalPairs;
}
