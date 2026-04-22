const dataAcquirer = require('fs');
const rawExpressionSource = dataAcquirer.readFileSync('/dev/stdin', 'utf8').trim();
const mathematicalOperations = {
    '+': (val1, val2) => val1 + val2,
    '-': (val1, val2) => val1 - val2,
    '*': (val1, val2) => val1 * val2,
    '/': (val1, val2) => val1 / val2
};
const evaluateRpnExpression = (expressionString) => {
    const componentParts = expressionString.trim().split(/\s+/);
    const computationalStack = componentParts.reduce((currentPile, currentElement) => {
        const numericConversion = parseFloat(currentElement);
        if (!isNaN(numericConversion)) {
            currentPile.push(numericConversion);
        } else if (mathematicalOperations[currentElement]) {
            const operandB = currentPile.pop();
            const operandA = currentPile.pop();
            const operationFunction = mathematicalOperations[currentElement];
            const intermediateResult = operationFunction(operandA, operandB);
            currentPile.push(intermediateResult);
        }
        return currentPile;
    }, []);
    return computationalStack.pop();
};
rawExpressionSource.split('\n').forEach(singleLineExpression => {
    const finalOutcome = evaluateRpnExpression(singleLineExpression);
    process.stdout.write(finalOutcome.toFixed(6) + '\n');
});