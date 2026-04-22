const performArithmetic = (rawInputLine) => {
    const parts = rawInputLine.match(/^(\S+)\s*([+-])\s*(\S+)$/);

    const firstOperandText = parts[1];
    const operationChar = parts[2];
    const secondOperandText = parts[3];

    const operationLookup = new Map();

    operationLookup.set('+', (leftStr, rightStr) => String(leftStr) + String(rightStr));
    operationLookup.set('-', (leftStr, rightStr) => Number(leftStr) - Number(rightStr));

    const calculationRoutine = operationLookup.get(operationChar);

    if (calculationRoutine) {
        console.log(calculationRoutine(firstOperandText, secondOperandText));
    }
};

performArithmetic(require('fs').readFileSync('/dev/stdin', 'utf8'));