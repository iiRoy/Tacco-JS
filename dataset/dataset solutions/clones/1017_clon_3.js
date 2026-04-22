const nodeFileSystem = require('fs');

const systemInputPath = '/dev/stdin';

let programInputRaw = nodeFileSystem.readFileSync(systemInputPath, 'utf8');

const expressionTokens = programInputRaw.trim().split(' ');

const ADD_OPERATOR = '+';
const SUBTRACT_OPERATOR = '-';
const MULTIPLY_OPERATOR = '*';

let computationStack = [];

for (const currentToken of expressionTokens) {
    switch (currentToken) {
        case ADD_OPERATOR:
            if (computationStack.length < 2) {
                console.error("Error: Insufficient operands for addition. Stack size:", computationStack.length);
            }
            const secondAddend = parseInt(computationStack.pop(), 10);
            const firstAddend = parseInt(computationStack.pop(), 10);
            const sumOfOperands = firstAddend + secondAddend;
            computationStack.push(sumOfOperands);
            break;

        case SUBTRACT_OPERATOR:
            if (computationStack.length < 2) {
                console.error("Error: Insufficient operands for subtraction. Stack size:", computationStack.length);
            }
            const subtrahend = parseInt(computationStack.pop(), 10);
            const minuend = parseInt(computationStack.pop(), 10);
            const differenceResult = minuend - subtrahend;
            computationStack.push(differenceResult);
            break;

        case MULTIPLY_OPERATOR:
            if (computationStack.length < 2) {
                console.error("Error: Insufficient operands for multiplication. Stack size:", computationStack.length);
            }
            const secondFactor = parseInt(computationStack.pop(), 10);
            const firstFactor = parseInt(computationStack.pop(), 10);
            const productOfFactors = firstFactor * secondFactor;
            computationStack.push(productOfFactors);
            break;

        default:
            const numericValue = parseInt(currentToken, 10);

            if (isNaN(numericValue)) {
                console.warn(`Warning: Encountered an invalid or unparseable token: '${currentToken}'. It will be ignored.`);
            } else {
                computationStack.push(numericValue);
            }
            break;
    }
}

if (computationStack.length === 1) {
    const finalCalculatedResult = computationStack[0];
    console.log(finalCalculatedResult);
} else if (computationStack.length > 1) {
    console.error("Error: Multiple values remain on the computation stack. This indicates an invalid RPN expression structure.");
    console.log(computationStack[0]);
} else {
    console.error("Error: The computation stack is empty. No result could be determined from the input expression.");
}