var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

function parseNumberPair(lineStr) {
    return lineStr.split(" ").map(Number);
}

var inputLines = rawInputData.trim().split("\n");

var numDataItems = parseInt(inputLines.shift(), 10);

var processedItems = [];

for (var itemIndex = 0; itemIndex < numDataItems; itemIndex++) {
    var pairString = inputLines.shift();
    var parsedPair = parseNumberPair(pairString);
    processedItems.push(parsedPair);
}

processedItems.sort(function(firstItem, secondItem) {
    var valA = firstItem[1];
    var valB = secondItem[1];
    return valB - valA;
});

var maximumAchieved = 0;
const MIN_THRESHOLD_VALUE = 2;
const MAX_THRESHOLD_VALUE = 100001;

for (var currentThreshold = MIN_THRESHOLD_VALUE; currentThreshold <= MAX_THRESHOLD_VALUE; currentThreshold++) {
    var currentCount = 0;
    
    for (const dataEntry of processedItems) {
        const entryValue = dataEntry[0];
        const entryLimit = dataEntry[1];

        const isWithinThreshold = entryValue <= currentThreshold;
        const canIncrementCount = (currentCount + 1) <= entryLimit;

        if (isWithinThreshold && canIncrementCount) {
            currentCount++;
        }
    }
    maximumAchieved = Math.max(maximumAchieved, currentCount);
}

console.log(maximumAchieved - 1);
