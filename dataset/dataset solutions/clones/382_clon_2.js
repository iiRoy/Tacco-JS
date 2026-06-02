var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.replace(/\n$/, "")).split("\n");

var numCases = lineSegments.shift() - 0;

for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    var currentNumbers = lineSegments[caseIndex].split(" ").map(Number);

    var startValue = currentNumbers[0];
    var targetValue = currentNumbers[1];

    var resultPath = [startValue];

    if (startValue === targetValue) {
        startValue = targetValue;
    } else if (startValue < targetValue) {
        do {
            startValue++;
            resultPath.push(startValue);
        } while (startValue !== targetValue);
    } else if (startValue > targetValue && startValue <= 5) {
        do {
            startValue--;
            resultPath.push(startValue);
        } while (startValue !== targetValue);
    } else {
        do {
            startValue++;
            if (startValue === 10) {
                startValue = 5;
            }
            resultPath.push(startValue);
        } while (startValue !== targetValue);
    }

    console.log(resultPath.join(" "));
}
