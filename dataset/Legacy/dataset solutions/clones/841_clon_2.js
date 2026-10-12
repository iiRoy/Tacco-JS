var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

var numOperations = lineSegments.shift() - 0;

var frequencyMap = {};

for (var idx = 2; idx <= 100001; idx++) {
    frequencyMap[idx] = 1;
}

for (var counter = 0; counter < numOperations; counter++) {
    var rangeBounds = (lineSegments.shift()).split(" ").map(Number);
    for (var currentVal = rangeBounds[0]; currentVal <= rangeBounds[1]; currentVal++) {
        frequencyMap[currentVal]++;
    }
}

var greatestValue = 1;

for (var idx = 2; idx <= 100001; idx++) {
    if (frequencyMap[idx] >= idx) {
        greatestValue = idx;
    }
}

console.log(greatestValue - 1);
