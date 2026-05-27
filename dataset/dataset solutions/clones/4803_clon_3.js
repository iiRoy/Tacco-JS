function performArithmeticOperation(valA, operatorSymbol, valB) {
    let operationResult;
    const ADDITION_OPERATOR = '+';
    const SUBTRACTION_OPERATOR = '-';

    switch (operatorSymbol) {
        case ADDITION_OPERATOR:
            operationResult = valA + valB;
            break;
        case SUBTRACTION_OPERATOR:
            operationResult = valA - valB;
            break;
        default:
            // If the operator is not recognized, no operation is performed,
            // mirroring the original's behavior of not logging anything.
            operationResult = undefined;
            break;
    }
    return operationResult;
}

function processInputData(rawInputContent) {
    const inputCharacters = rawInputContent.split('');

    const firstOperandCharIndex = 0;
    const operatorCharIndex = 2;
    const secondOperandCharIndex = 4;

    const firstNumericValue = Number(inputCharacters[firstOperandCharIndex]);
    const currentOperator = inputCharacters[operatorCharIndex];
    const secondNumericValue = Number(inputCharacters[secondOperandCharIndex]);

    const computedValue = performArithmeticOperation(firstNumericValue, currentOperator, secondNumericValue);

    if (computedValue !== undefined) {
        console.log(computedValue);
    }
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processInputData(standardInputContent);
