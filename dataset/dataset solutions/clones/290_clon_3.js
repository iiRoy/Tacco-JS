var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var inputLines = rawData.split('\n');

function processRPNExpression(expressionSegments) {
    const operandStack = [];
    while (expressionSegments.length > 0) {
        const currentSegment = expressionSegments.shift();

        if (Number(currentSegment) == currentSegment) {
            operandStack.push(Number(currentSegment));
        } else {
            const operandB = operandStack.pop();
            const operandA = operandStack.pop();

            let operationResult;
            switch (currentSegment) {
                case '+':
                    operationResult = operandB + operandA;
                    break;
                case '-':
                    operationResult = operandB - operandA;
                    break;
                case '*':
                    operationResult = operandB * operandA;
                    break;
                case '/':
                    operationResult = operandB / operandA;
                    break;
                default:
                    throw new ReferenceError(`Operator '${currentSegment}' is not defined.`);
            }
            operandStack.push(operationResult);
        }
    }
    return operandStack.pop();
}

var currentLine;
while ((currentLine = inputLines.shift()) !== undefined) {
    const processedLine = currentLine.trim();
    const lineSegments = processedLine.split(/ +/);

    const finalResult = processRPNExpression(lineSegments);

    console.log(finalResult.toFixed(6));
}
