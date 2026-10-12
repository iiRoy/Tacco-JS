var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

let currentLineIndex = 0;
let continueProcessing = true;

function evaluateExpression(expressionText) {
    return new Function('return ' + expressionText)();
}

while (continueProcessing && currentLineIndex < lines.length) {
    const currentStatement = lines[currentLineIndex];
    const statementTokens = currentStatement.split(' ');

    if (statementTokens.length > 1 && statementTokens[1] === '?') {
        continueProcessing = false;
    } else {
        const computedValue = evaluateExpression(currentStatement);
        console.log(Math.floor(computedValue));
    }
    currentLineIndex++;
}
