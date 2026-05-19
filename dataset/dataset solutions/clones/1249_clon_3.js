var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.split("\n");
var resultsCollection = [];

function executeOperation(firstVal, opChar, secondVal) {
    let computedResult;
    switch (opChar) {
        case "+":
            computedResult = firstVal + secondVal;
            break;
        case "-":
            computedResult = firstVal - secondVal;
            break;
        case "*":
            computedResult = firstVal * secondVal;
            break;
        case "/":
            computedResult = Math.floor(firstVal / secondVal);
            break;
        default:
            return null;
    }
    return computedResult;
}

for (var lineIndex = 0; lineIndex < lineSegments.length; lineIndex++) {
    var currentLine = lineSegments[lineIndex];
    var parts = currentLine.split(" ");

    var operandA = Number(parts[0]);
    var operatorSymbol = parts[1];
    var operandC = Number(parts[2]);

    if (operatorSymbol === "?") {
        break;
    }

    let lineOutputContent = "";

    let calculatedValue = executeOperation(operandA, operatorSymbol, operandC);

    if (calculatedValue !== null) {
        lineOutputContent = String(calculatedValue);
    }
    
    resultsCollection.push(lineOutputContent);
}

console.log(resultsCollection.join("\n").trim());
