var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var numericValues = (rawData.trim()).split("\n").map(Number);

for (
    var idx = 0;
    idx < numericValues.length;
    idx = idx + 2
) {
    var baseVal = numericValues[idx];
    var heightVal = numericValues[idx + 1];

    if (baseVal === 0 && heightVal === 0) {
        break;
    }

    var surfaceArea = baseVal * Math.sqrt(4 * heightVal * heightVal + baseVal * baseVal) + baseVal * baseVal;

    console.log(surfaceArea.toFixed(5));
}
