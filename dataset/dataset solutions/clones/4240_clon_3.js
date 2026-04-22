const inputReaderModule = require('readline');

let collectedInputLines = [];

const consoleInputHandler = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

consoleInputHandler.on('line', (currentLineContent) => {
    const trimmedLine = currentLineContent.trim();
    if (trimmedLine.length > 0) {
        collectedInputLines.push(trimmedLine);
    }
});

consoleInputHandler.on('close', () => {
    if (collectedInputLines.length === 0) {
        console.error("Error: No input lines were received. Cannot perform calculation.");
        process.exit(1);
    }

    const rawParameterString = collectedInputLines[0];

    if (typeof rawParameterString !== 'string' || rawParameterString.length === 0) {
        console.error("Error: The first input line is invalid or empty.");
        process.exit(1);
    }

    const parameterTokens = rawParameterString.trim().split(/\s+/);

    if (parameterTokens.length < 2) {
        console.error("Error: Insufficient parameters provided on the first line. Expected two numbers.");
        process.exit(1);
    }

    let totalItemsCount = Number(parameterTokens[0]);
    let specificItemsCount = Number(parameterTokens[1]);

    if (isNaN(totalItemsCount) || isNaN(specificItemsCount)) {
        console.error(`Error: Invalid numerical input. Received '${parameterTokens[0]}' and '${parameterTokens[1]}'.`);
        process.exit(1);
    }
    if (totalItemsCount < 0 || specificItemsCount < 0) {
        console.error("Error: Input counts must be non-negative.");
        process.exit(1);
    }
    if (specificItemsCount > totalItemsCount) {
        console.warn("Warning: Specific items count is greater than total items count. Calculation proceeds but may indicate unusual input.");
    }

    const powerBase = 2;
    const exponentialFactor = powerBase ** specificItemsCount;

    const constantFactorA = 1800;
    const constantFactorB = 100;

    const innerExpressionValue = (constantFactorA * specificItemsCount) + (constantFactorB * totalItemsCount);

    const finalComputedValue = exponentialFactor * innerExpressionValue;

    console.log(finalComputedValue);
});