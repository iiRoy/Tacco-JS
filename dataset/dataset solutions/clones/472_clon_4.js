const greatestCommonDivisor = (firstOperand, secondOperand) => {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return greatestCommonDivisor(secondOperand, firstOperand % secondOperand);
};

const leastCommonMultiple = (valueA, valueB) => {
    if (valueA === 0 || valueB === 0) return 0;
    return (Math.abs(valueA * valueB)) / greatestCommonDivisor(valueA, valueB);
};

function* inputLineStreamGenerator(rawInputContent) {
    const lines = rawInputContent.trim().split('\n');
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const executeFractionOperations = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lineIterator = inputLineStreamGenerator(fileContent);

    let currentInputLine;
    while ((currentInputLine = lineIterator.next().value) !== undefined) {
        const numberOfPairs = Number(currentInputLine);
        if (numberOfPairs === 0) {
            break;
        }

        const processedFractions = Array.from({ length: numberOfPairs }, () => {
            const [numeratorVal, denominatorVal] = lineIterator.next().value.split(' ').map(Number);
            const commonFactor = greatestCommonDivisor(numeratorVal, denominatorVal);
            return [numeratorVal / commonFactor, denominatorVal / commonFactor];
        });

        const commonDenominatorForSet = processedFractions.reduce((accumulator, [, currentDenominator]) =>
            leastCommonMultiple(accumulator, currentDenominator), 1);

        const adjustedNumerators = processedFractions.map(([currentNumerator, currentDenominator]) =>
            currentNumerator * (commonDenominatorForSet / currentDenominator));

        const finalNumeratorLCM = adjustedNumerators.reduce((accumulator, currentNumerator) =>
            leastCommonMultiple(accumulator, currentNumerator), 1);

        adjustedNumerators.forEach(adjustedNum => {
            console.log(finalNumeratorLCM / adjustedNum);
        });
    }
};

executeFractionOperations();
