'use strict';

const processInputValues = (sourceText) => {
    const components = sourceText.split(' ');
    let firstValue, secondValue;
    let assignedCount = 0;

    for (let i = 0; i < components.length; i++) {
        const currentNumeric = Number(components[i]);
        if (assignedCount === 0) {
            firstValue = currentNumeric;
            assignedCount++;
        } else if (assignedCount === 1) {
            secondValue = currentNumeric;
            assignedCount++;
            break;
        }
    }
    return { primary: firstValue, secondary: secondValue };
};

const deriveFormattedDivision = (dividend, divisor, decimalPlaces) => {
    const quotient = dividend / divisor;
    return quotient.toFixed(decimalPlaces);
};

const computeAllResults = (valA, valB) => {
    const outcome = {};

    outcome.integralQuotient = Math.floor(valA / valB);
    outcome.remainderResult = valA % valB;
    outcome.preciseQuotient = deriveFormattedDivision(valA, valB, 5);

    return outcome;
};

process.stdin.on('data', function(inputBuffer) {
    const cleanedInput = inputBuffer.toString().trim();
    const parsedOperands = processInputValues(cleanedInput);
    const { primary: firstOperand, secondary: secondOperand } = parsedOperands;

    const finalCalculations = computeAllResults(firstOperand, secondOperand);

    console.log(
        finalCalculations.integralQuotient,
        finalCalculations.remainderResult,
        finalCalculations.preciseQuotient
    );
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
