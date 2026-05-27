let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataRows = rawData.trim().split('\n'); // Process raw input into an array of lines

const numericArrays = dataRows.map(function(currentRow) {
    // For each line, split by comma and convert parts to numbers
    return currentRow.split(',').map(function(numStr) {
        return +numStr;
    });
});

let totalProductSum = numericArrays.reduce(function(accumulatorProduct, currentPair) {
    // Calculate the sum of (first element * second element) for each pair
    return accumulatorProduct + currentPair[0] * currentPair[1];
}, 0);

let totalSecondElementSum = numericArrays.reduce(function(accumulatorSecond, currentElement) {
    // Calculate the sum of all second elements
    return accumulatorSecond + currentElement[1];
}, 0);

// Output the calculated sum and the rounded average of the second elements
console.log(totalProductSum, Math.round(totalSecondElementSum / numericArrays.length));
