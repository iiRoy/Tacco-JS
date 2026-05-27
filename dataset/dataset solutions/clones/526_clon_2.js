var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = rawData.trim().split("\n");

var configValues = lines.shift().split(" ").map(Number);

var totalItems = configValues[0];
var numEntries = configValues[1];
var targetValue = configValues[2];

var filteredValues = [];

for (var idx = 0; idx < numEntries; idx++) {
   var currentEntry = lines.shift() - 0;
   if (currentEntry !== targetValue) {
       filteredValues.push(currentEntry);
   }
}

filteredValues = filteredValues.concat(targetValue);

filteredValues.sort(function(valA, valB) {
    return valA - valB;
});

var minimumDistance = Infinity;

filteredValues.forEach(function(currentVal, valIndex) {
    if (currentVal < targetValue) {
        if (valIndex !== 0) {
            minimumDistance = Math.min(minimumDistance, (targetValue - currentVal) * 2 + (totalItems - targetValue + 1) + filteredValues[valIndex - 1]);
        }
    }
    if (targetValue === currentVal) {
        if (valIndex === 0) {
            minimumDistance = Math.min(minimumDistance, filteredValues[filteredValues.length - 1] - currentVal);
        }
        if (valIndex === filteredValues.length - 1) {
            minimumDistance = Math.min(minimumDistance, currentVal - filteredValues[0]);
        }
        if (valIndex !== filteredValues.length - 1) {
            minimumDistance = Math.min(minimumDistance, targetValue + totalItems - filteredValues[valIndex + 1] + 1);
        }
        if (valIndex !== 0) {
            minimumDistance = Math.min(minimumDistance, totalItems - targetValue + 1 + filteredValues[valIndex - 1]);
        }
    }
    if (targetValue < currentVal) {
        if (valIndex !== filteredValues.length - 1) {
            minimumDistance = Math.min(minimumDistance, (currentVal - targetValue) * 2 + targetValue + (totalItems - filteredValues[valIndex + 1] + 1));
        }
    }
});

console.log(minimumDistance * 100);
