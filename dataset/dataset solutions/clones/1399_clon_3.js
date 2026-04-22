const retrieveModule = require;

const outputResult = console.log;

const roundDownToNearestInteger = (numericValue) => {
    if (typeof numericValue !== 'number' || isNaN(numericValue)) {
        return NaN;
    }
    return Math.floor(numericValue);
};

const evaluateStringAsCode = (codeString) => {
    if (typeof codeString !== 'string' || codeString.trim() === '') {
        console.warn("Attempted to evaluate an invalid or empty code string.");
        return NaN;
    }
    try {
        return eval(codeString);
    } catch (e) {
        console.error(`Failed to evaluate expression "${codeString}": ${e.message}`);
        return NaN;
    }
};

const fileSystemInterface = retrieveModule('fs');

const rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const expressionQueue = rawInputContent.split('\n');

let totalOperationsProcessed = 0;

while (true) {
    const currentExpressionString = expressionQueue.shift();

    if (currentExpressionString === undefined) {
        console.error("Critical Error: Input stream ended without a proper termination signal.");
        break;
    }

    const partsOfExpression = currentExpressionString.split(' ');

    const terminationIndicator = partsOfExpression[1];

    if (terminationIndicator === '?') {
        break;
    }

    let computedNumericResult;
    try {
        computedNumericResult = evaluateStringAsCode(currentExpressionString);
    } catch (evaluationError) {
        console.error(`Evaluation failed for "${currentExpressionString}": ${evaluationError.message}`);
        continue;
    }

    if (typeof computedNumericResult !== 'number' || isNaN(computedNumericResult)) {
        console.warn(`Skipping output for "${currentExpressionString}" as it did not yield a valid number.`);
        continue;
    }

    const finalIntegerResult = roundDownToNearestInteger(computedNumericResult);

    outputResult(finalIntegerResult);

    totalOperationsProcessed++;
}