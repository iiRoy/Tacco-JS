var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var trimmedInput = rawData.trim();
var stringValues = trimmedInput.split("\n");
var numericValues = stringValues.map(Number);
var calculatedTotal = 0;
var processingLimit = 10;
numericValues.slice(0, processingLimit).forEach(function(currentValue) {
    calculatedTotal += currentValue;
});
console.log(calculatedTotal);
