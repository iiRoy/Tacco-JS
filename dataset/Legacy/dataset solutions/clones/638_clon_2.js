var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = rawData.trim().split("\n");

var dimensions = lineSegments.shift().split(" ").map(Number);

var numItems = dimensions[0];
var numCategories = dimensions[1];

var itemCosts = [];
for (var itemIdx = 0; itemIdx < numItems; itemIdx++) {
    itemCosts.push(lineSegments.shift() - 0);
}

var categoryMultipliers = [];
for (var catIdx = 0; catIdx < numCategories; catIdx++) {
    categoryMultipliers.push(lineSegments.shift() - 0);
}

var memoTable = [];
for (var catIdx = 0; catIdx <= numCategories; catIdx++) {
    memoTable[catIdx] = [];
    for (var itemIdx = 0; itemIdx <= numItems; itemIdx++) {
        memoTable[catIdx][itemIdx] = Infinity;
    }
}

memoTable[0][0] = 0;

for (var currentCat = 0; currentCat < numCategories; currentCat++) {
    var currentMultiplier = categoryMultipliers[currentCat];
    for (var currentItem = 0; currentItem < numItems; currentItem++) {
        var currentItemCost = itemCosts[currentItem];
        for (var stepSize = 1; currentCat + stepSize <= numCategories; stepSize++) {
            memoTable[currentCat + stepSize][currentItem] = Math.min(
                memoTable[currentCat + stepSize][currentItem],
                memoTable[currentCat][currentItem]
            );
            memoTable[currentCat + stepSize][currentItem + 1] = Math.min(
                memoTable[currentCat + stepSize][currentItem + 1],
                memoTable[currentCat][currentItem] + currentMultiplier * currentItemCost
            );
        }
    }
}

console.log(memoTable[numCategories][numItems]);
