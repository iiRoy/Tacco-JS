const acquireNumericInput = () => parseInt(require('fs').readFileSync('/dev/stdin', 'ascii'));

const evaluateNumberCriteria = (currentValue) => {
    const isDivisibleByThree = currentValue % 3 === 0;
    const containsDigitThree = String(currentValue).includes('3');
    return isDivisibleByThree || containsDigitThree;
};

const generateFilteredSequence = (upperBound) => {
    return Array.from({ length: upperBound }, (_, index) => index + 1)
                .filter(evaluateNumberCriteria);
};

const executeProgram = () => {
    const limitValue = acquireNumericInput();
    const qualifyingNumbers = generateFilteredSequence(limitValue);
    console.log(qualifyingNumbers.join(" "));
};

executeProgram();
