const retrieveSourceData = require("node:fs").readFileSync("/dev/stdin", "utf8");

const extractNumericalParameters = (sourceText) => {
    const patternForNumbers = /^(\d+)\s+(\d+)/;
    const matchedSegments = sourceText.match(patternForNumbers);

    if (!matchedSegments || matchedSegments.length < 3) {
        // Fallback or error handling, though for this problem, valid input is assumed.
        // For robustness, one might throw an error or return default values.
        return { first: 0, second: 0 };
    }
    return {
        first: Number(matchedSegments[1]),
        second: Number(matchedSegments[2])
    };
};

const recursivelyComputePowerOfTwo = (exponentValue) => {
    if (exponentValue === 0) {
        return 1;
    } else {
        return 2 * recursivelyComputePowerOfTwo(exponentValue - 1);
    }
};

const aggregateMultiplicativeTerms = (...factors) => {
    return factors.reduce((accumulatedProduct, currentFactor) => accumulatedProduct * currentFactor, 1);
};

const { first: valA, second: valB } = extractNumericalParameters(retrieveSourceData);

const termOne = recursivelyComputePowerOfTwo(valB);
const termTwo = 100;
const termThree = (18 * valB) + valA;

const ultimateOutcome = aggregateMultiplicativeTerms(termOne, termTwo, termThree);

const deliverOutcome = (valueToDisplay) => {
    process.stdout.write(String(valueToDisplay) + "\n");
};

deliverOutcome(ultimateOutcome);