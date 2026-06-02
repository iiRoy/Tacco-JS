var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.trim().split("\n");
var countVal = lineSegments.shift();
var operandStack = lineSegments.shift().split(" ");

function convertToBoolean(inputString) {
    return inputString === "T";
}

function convertToString(inputBoolean) {
    return inputBoolean ? "T" : "F";
}

var evaluateExpression = function(currentOperands) {
    var firstOperandString = currentOperands.shift();
    var secondOperandString = currentOperands.shift();

    var booleanA = convertToBoolean(firstOperandString);
    var booleanB = convertToBoolean(secondOperandString);

    var computedResultBoolean = (!booleanA || booleanB);

    var resultStringValue = convertToString(computedResultBoolean);

    if (currentOperands.length !== 0) {
        currentOperands.unshift(resultStringValue);
        evaluateExpression(currentOperands);
    } else {
        console.log(resultStringValue);
    }
};

evaluateExpression(operandStack);
