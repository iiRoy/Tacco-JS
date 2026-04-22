const processInput = (rawTextContent) => {
    const numericalSegment = parseInt(rawTextContent.split(' ')[0], 10);
    return numericalSegment;
};

const determineMagnitude = (quantity) => {
    if (quantity === 0) return 1;
    return Math.floor(Math.log10(quantity)) + 1;
};

const powerOfTen = (expVal) => Math.pow(10, expVal);

const recursivelyEvaluate = (currentSpan, maximumSpans, targetLimit) => {
    if (currentSpan > maximumSpans) {
        return 0;
    }

    if (currentSpan === maximumSpans) {
        if (currentSpan % 2 === 1) {
            return targetLimit - powerOfTen(currentSpan - 1) + 1;
        }
        return 0;
    }

    let partialContribution = 0;
    if (currentSpan % 2 === 1) {
        partialContribution = 9 * powerOfTen(currentSpan - 1);
    }
    return partialContribution + recursivelyEvaluate(currentSpan + 1, maximumSpans, targetLimit);
};

const calculateTotalOddDigitInstances = (upperBoundary) => {
    if (upperBoundary <= 0) return 0;
    const boundaryLength = determineMagnitude(upperBoundary);
    return recursivelyEvaluate(1, boundaryLength, upperBoundary);
};

const programEntry = (sourceData) => {
    const acquiredValue = processInput(sourceData);
    const ultimateResult = calculateTotalOddDigitInstances(acquiredValue);
    console.log(ultimateResult);
};

programEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));