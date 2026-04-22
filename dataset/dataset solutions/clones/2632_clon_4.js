const evaluateGreatestCommonDivisor = (firstOperand, secondOperand) => {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return evaluateGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
};

const calculateLeastCommonMultiple = (valueA, valueB) => {
    return (valueA * valueB) / evaluateGreatestCommonDivisor(valueA, valueB);
};

const processDataStream = (rawDataContent) => {
    const linesOfText = rawDataContent.split('\n');
    const numericSequence = linesOfText[1].split(' ').map(Number);

    const initialFraction = [1, numericSequence[0]];

    const finalSumFraction = numericSequence.slice(1).reduce((currentAccumulatedFraction, nextElementValue) => {
        const [currentNumerator, currentDenominator] = currentAccumulatedFraction;
        
        const commonDenominatorForAddition = calculateLeastCommonMultiple(currentDenominator, nextElementValue);

        const combinedNumeratorForAddition = 
            currentNumerator * (commonDenominatorForAddition / currentDenominator) +
            1 * (commonDenominatorForAddition / nextElementValue);

        return [combinedNumeratorForAddition, commonDenominatorForAddition];
    }, initialFraction);

    const [resultNumerator, resultDenominator] = finalSumFraction;
    return resultDenominator / resultNumerator;
};

console.log(processDataStream(require("fs").readFileSync("/dev/stdin", "utf8")));