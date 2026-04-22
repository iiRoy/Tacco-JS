const obtainGreatestCommonDivisor = (firstOperand, secondOperand) => {
    while (secondOperand !== 0) {
        let temporaryValue = secondOperand;
        secondOperand = firstOperand % secondOperand;
        firstOperand = temporaryValue;
    }
    return firstOperand;
};

const calculateLeastCommonMultipleOfTwo = (valueA, valueB) => {
    if (valueA === 0 || valueB === 0) return 0;
    return (Math.abs(valueA * valueB)) / obtainGreatestCommonDivisor(valueA, valueB);
};

const determineOverallLeastCommonMultiple = (numericCollection) => {
    if (numericCollection.length === 0) return 1;
    return numericCollection.reduce((accumulator, currentElement) => calculateLeastCommonMultipleOfTwo(accumulator, currentElement));
};

const processInputData = (rawTextLines) => {
    const headerLineParts = rawTextLines[0].split(" ");
    const elementCount = parseInt(headerLineParts[0], 10); // Parsed but not utilized in final computation
    const rangeMaximum = parseInt(headerLineParts[1], 10);

    const numericSequence = rawTextLines[1].split(" ").map(strVal => parseInt(strVal, 10));

    const derivedCommonMultiple = determineOverallLeastCommonMultiple(numericSequence);

    const divisorComponent = derivedCommonMultiple / 2;
    const ratioForCounting = rangeMaximum / divisorComponent;
    const finalResult = Math.ceil(ratioForCounting / 2);

    return finalResult;
};

console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")));