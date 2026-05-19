const fileSystemModule = require('fs');
const inputSourcePath = '/dev/stdin';

function processRpnLine(expressionLineContent) {
    const expressionTokens = expressionLineContent.split(/\s/);
    const evaluationStack = [];

    const binaryOperators = {
        '+': (firstOp, secondOp) => firstOp + secondOp,
        '-': (firstOp, secondOp) => firstOp - secondOp,
        '*': (firstOp, secondOp) => firstOp * secondOp,
        '/': (firstOp, secondOp) => firstOp / secondOp
    };

    for (let currentTokenValue of expressionTokens) {
        const operatorFunction = binaryOperators[currentTokenValue];

        if (operatorFunction) {
            const operandB = evaluationStack.pop();
            const operandA = evaluationStack.pop();

            const operationResult = operatorFunction(operandA, operandB);
            evaluationStack.push(operationResult);
        } else {
            const parsedNumericValue = parseFloat(currentTokenValue);
            const valueToPush = isNaN(parsedNumericValue) ? 0 : parsedNumericValue;
            evaluationStack.push(valueToPush);
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
