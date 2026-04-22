const dataExtractor = (sourceContent) => {
    const lineFeed = (function* () {
        const rawLines = sourceContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        for (const lineEntry of rawLines) {
            yield lineEntry;
        }
    })();

    let currentParseBuffer = [];

    const primeTokenizer = () => {
        if (currentParseBuffer.length === 0) {
            const { value, done } = lineFeed.next();
            if (done) return false;
            currentParseBuffer = value.split(' ').reverse();
        }
        return true;
    };

    const extractNumber = () => {
        if (!primeTokenizer()) throw new Error("Input depleted for scalar retrieval.");
        return Number(currentParseBuffer.pop());
    };

    const extractNumberSequence = () => {
        const { value, done } = lineFeed.next();
        if (done) throw new Error("Input depleted for sequence retrieval.");
        currentParseBuffer = [];
        return value.split(' ').map(Number);
    };

    return {
        retrieveNumericValue: extractNumber,
        retrieveNumericArray: extractNumberSequence,
    };
};

const evaluateStepwiseSum = (currentStep, sizeOfCollection, numericRecords) => {
    let localMaximum = 0;
    let currentAggregate = 0;
    const markedIndices = new Array(sizeOfCollection).fill(false);

    const exploreMultiples = (factor) => {
        const primaryIndex = factor * currentStep;
        const conjugateIndex = sizeOfCollection - primaryIndex - 1;

        if (primaryIndex >= sizeOfCollection ||
            markedIndices[primaryIndex] ||
            markedIndices[conjugateIndex] ||
            primaryIndex === conjugateIndex) {
            return;
        }

        currentAggregate += numericRecords[primaryIndex] + numericRecords[conjugateIndex];
        localMaximum = Math.max(localMaximum, currentAggregate);

        markedIndices[primaryIndex] = true;
        markedIndices[conjugateIndex] = true;

        exploreMultiples(factor + 1);
    };

    exploreMultiples(1);
    return localMaximum;
};

const computeResult = () => {
    const dataSource = dataExtractor(require("fs").readFileSync("/dev/stdin", "utf8"));
    const sizeOfCollection = dataSource.retrieveNumericValue();
    const numericRecords = dataSource.retrieveNumericArray();

    const midpointBound = sizeOfCollection >> 1;

    const stepMagnitudeRange = Array.from({ length: Math.max(0, midpointBound - 1) }, (_, idx) => idx + 1);

    const peakAccumulation = stepMagnitudeRange.reduce((currentOverallMax, currentStep) => {
        const strideSpecificMax = evaluateStepwiseSum(currentStep, sizeOfCollection, numericRecords);
        return Math.max(currentOverallMax, strideSpecificMax);
    }, 0);

    return peakAccumulation;
};

console.log(computeResult());