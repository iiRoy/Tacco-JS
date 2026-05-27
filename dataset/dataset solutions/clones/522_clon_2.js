var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var eventLines = rawData.trim().split("\n");

var configParams = eventLines.shift().split(" ").map(Number);

var itemCount = configParams[0];
var limitVal = configParams[2];

var itemStates = [];
for (var idx = 0; idx < itemCount; idx++) {
    itemStates[idx] = [0, 0, idx];
}

var currentPeak = [0, 0];
var elapsedTime = 0;

eventLines.push([1, limitVal, 0].join(" "));

for (var idx = 0; idx < eventLines.length; idx++) {
    var eventDetails = eventLines[idx].split(" ").map(Number);

    var targetIdx = eventDetails[0] - 1;
    var eventTimestamp = eventDetails[1];
    var valueChange = eventDetails[2];

    itemStates[currentPeak[0]][1] += eventTimestamp - elapsedTime;
    elapsedTime = eventTimestamp;
    itemStates[targetIdx][0] += valueChange;

    if (valueChange > 0) {
        if (itemStates[targetIdx][0] > currentPeak[1]) {
            currentPeak = [targetIdx, itemStates[targetIdx][0]];
        } else if (itemStates[targetIdx][0] === currentPeak[1] && targetIdx <= currentPeak[0]) {
            currentPeak = [targetIdx, itemStates[targetIdx][0]];
        }
    } else if (valueChange < 0 && currentPeak[0] === targetIdx) {
        var highestVal = 0;
        var peakItemIdx = 0;
        for (var innerIdx = 0; innerIdx < itemStates.length; innerIdx++) {
            if (highestVal < itemStates[innerIdx][0]) {
                peakItemIdx = innerIdx;
                highestVal = itemStates[innerIdx][0];
            }
        }
        currentPeak = [peakItemIdx, itemStates[peakItemIdx][0]];
    }
}

var highestVal = 0;
var peakItemIdx = 0;
for (var idx = 0; idx < itemStates.length; idx++) {
    if (highestVal < itemStates[idx][1]) {
        peakItemIdx = idx;
        highestVal = itemStates[idx][1];
    }
}
console.log(peakItemIdx + 1);
