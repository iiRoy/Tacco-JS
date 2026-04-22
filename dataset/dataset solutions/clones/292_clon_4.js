const obtainInput = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const operationRegistry = new Map([
    ['+', (operandB, operandA) => operandA + operandB],
    ['-', (operandB, operandA) => operandA - operandB],
    ['*', (operandB, operandA) => operandA * operandB],
    ['/', (operandB, operandA) => operandA / operandB]
]);

const rpnProcessor = (currentCalculationPile, currentSymbol) => {
    const operation = operationRegistry.get(currentSymbol);
    if (operation) {
        const pileSize = currentCalculationPile.length;
        const operandB = Number(currentCalculationPile[pileSize - 1]);
        const operandA = Number(currentCalculationPile[pileSize - 2]);
        
        const newPile = currentCalculationPile.slice(0, Math.max(0, pileSize - 2));
        const resultValue = operation(operandB, operandA);
        return [...newPile, resultValue];
    } else {
        if (currentSymbol === "") {
            return [...currentCalculationPile, 0];
        } else {
            const numericForm = Number(currentSymbol);
            if (!Number.isNaN(numericForm)) {
                return [...currentCalculationPile, numericForm.toFixed(6)];
            } else {
                return [...currentCalculationPile, 0];
            }
        }
    }
};

obtainInput()
    .split(/\r?\n/)
    .forEach(expressionLine => {
        const partsOfExpression = expressionLine.split(/\s/);
        
        const finalCalculationPile = partsOfExpression.reduce(rpnProcessor, []);
        
        if (finalCalculationPile.length > 0) {
            console.log(finalCalculationPile[0]);
        } else {
            console.log(undefined);
        }
    });