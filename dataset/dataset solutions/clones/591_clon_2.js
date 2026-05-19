var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = (rawData.trim()).split("\n");
for (var mainIndex = 0; mainIndex < dataLines.length; mainIndex++) {
    var initialValue = dataLines[mainIndex] - 0;
    if (initialValue === 0) {
        break;
    }
    var cumulativeTotal = 0;
    for (var subIndex = 0; subIndex < 10; subIndex++) {
        cumulativeTotal += (dataLines[mainIndex + subIndex] - 0);
    }
    console.log(initialValue - cumulativeTotal);
    mainIndex += 10;
}
