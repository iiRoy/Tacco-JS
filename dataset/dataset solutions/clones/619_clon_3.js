var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.trim().split("\n");

var initialNumericValue = parseFloat(lineSegments[0]);
var currentAccumulatedValue = initialNumericValue;

function applyRoundingAndConvert(valueToRound) {
    // The original code uses toFixed(0)-0, which rounds to the nearest integer.
    // Math.round() provides identical behavior for rounding to the nearest integer.
    return Math.round(valueToRound);
}

for (var segmentIndex = 1; segmentIndex < lineSegments.length; segmentIndex += 2) {
    var operationSymbol = lineSegments[segmentIndex];

    if (operationSymbol === "=") {
        break;
    }

    var operandString = lineSegments[segmentIndex + 1];
    var operandNumericValue = parseFloat(operandString);

    switch (operationSymbol) {
        case "+":
            currentAccumulatedValue += operandNumericValue;
            break;
        case "-":
            currentAccumulatedValue -= operandNumericValue;
            break;
        case "*":
            currentAccumulatedValue *= operandNumericValue;
            break;
        case "/":
            currentAccumulatedValue /= operandNumericValue;
            break;
    }

    currentAccumulatedValue = applyRoundingAndConvert(currentAccumulatedValue);
}

console.log(currentAccumulatedValue);
