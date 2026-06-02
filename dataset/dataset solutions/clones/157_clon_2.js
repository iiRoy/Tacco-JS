var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

var romanSymbols = "I,V,X,L,C,D,M".split(",");
var symbolValues = [1, 5, 10, 50, 100, 500, 1000];

var symbolMap = {};
romanSymbols.forEach(function(currentSymbol, indexPosition) {
    symbolMap[currentSymbol] = symbolValues[indexPosition];
});

lineSegments.forEach(function(currentLine) {
    var charArray = currentLine.split("");
    var totalValue = 0;
    var previousValue = 1000;

    charArray.forEach(function(charItem) {
        var currentValue = symbolMap[charItem];
        if (previousValue < currentValue) {
            totalValue += currentValue - (2 * previousValue);
            previousValue = 1000;
        } else {
            totalValue += currentValue;
            previousValue = currentValue;
        }
    });
    console.log(totalValue);
});
