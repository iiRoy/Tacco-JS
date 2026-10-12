var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = rawData.trim().split("\n");

var dimensions = lineArray.shift().split(" ").map(Number);
var numItems = dimensions[0];
var numCategories = dimensions[1];

var itemValues = [];
for (var idxA = 0; idxA < numItems; idxA++) {
    itemValues.push(+lineArray.shift());
}

var categoryCosts = [];
for (var idxB = 0; idxB < numCategories; idxB++) {
    categoryCosts.push(+lineArray.shift());
}

var memoTable = [];
for (var rowIdx = 0; rowIdx <= numCategories; rowIdx++) {
    memoTable[rowIdx] = [];
    for (var colIdx = 0; colIdx <= numItems; colIdx++) {
        memoTable[rowIdx][colIdx] = Number.POSITIVE_INFINITY;
    }
}

memoTable[0][0] = 0.0;

for (var catIter = 0; catIter < numCategories; catIter++) {
    for (var itemIter = 0; itemIter < numItems; itemIter++) {
        memoTable[catIter + 1][itemIter] = Math.min(memoTable[catIter + 1][itemIter], memoTable[catIter][itemIter]);
        memoTable[catIter + 1][itemIter + 1] = Math.min(
            memoTable[catIter + 1][itemIter + 1],
            memoTable[catIter][itemIter] + categoryCosts[catIter] * itemValues[itemIter]
        );
    }
}

var finalMinimum = Number.POSITIVE_INFINITY;
for (var resultIter = 0; resultIter <= numCategories; resultIter++) {
    finalMinimum = Math.min(finalMinimum, memoTable[resultIter][numItems]);
}

console.log(finalMinimum);
