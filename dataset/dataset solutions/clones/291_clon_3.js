const fileSystemModule = require('fs');
const inputSourcePath = '/dev/stdin';

function processRpnLine(expressionLineContent) {
    const expressionTokens = expressionLineContent.split(/\s/);
    const evaluationStack = [];

    const binaryOperators = Object.create(null);

    binaryOperators['+'] = function(stackRef) {
        stackRef.push(stackRef.pop() + stackRef.pop());
    };

    binaryOperators['-'] = function(stackRef) {
        stackRef.push(-stackRef.pop() + stackRef.pop());
    };

    binaryOperators['*'] = function(stackRef) {
        stackRef.push(stackRef.pop() * stackRef.pop());
    };

    binaryOperators['/'] = function(stackRef) {
        stackRef.push(1 / stackRef.pop() * stackRef.pop());
    };

    for (let tokenIndex = 0; tokenIndex < expressionTokens.length; tokenIndex++) {
        const currentTokenValue = expressionTokens[tokenIndex];

        if (Object.prototype.hasOwnProperty.call(binaryOperators, currentTokenValue)) {
            binaryOperators[currentTokenValue](evaluationStack);
        } else {
            evaluationStack.push(
                isNaN(currentTokenValue) ? 0 : parseFloat(currentTokenValue)
            );
        }
    }

    return evaluationStack[0];
}

const rawInputData = fileSystemModule.readFileSync(inputSourcePath, 'utf8');
const inputLinesArray = rawInputData.split(/\n/);

for (let currentLineIndex = 0; currentLineIndex < inputLinesArray.length; currentLineIndex++) {
    const currentExpressionString = inputLinesArray[currentLineIndex];
    const finalCalculatedValue = processRpnLine(currentExpressionString);

    console.log(finalCalculatedValue.toFixed(6));
}