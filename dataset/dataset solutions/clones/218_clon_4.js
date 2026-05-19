const fileSystemModule = require("fs");

const segmentArrayIntoChunks = (sourceArray, segmentSize) => {
    const totalSegments = Math.ceil(sourceArray.length / segmentSize);
    return Array.from({ length: totalSegments }, (_, segmentIndex) =>
        sourceArray.slice(segmentIndex * segmentSize, segmentIndex * segmentSize + segmentSize)
    );
};

function* generateFractionalDigits(initialNumerator, denominator) {
    let currentNumerator = initialNumerator;
    while (true) {
        currentNumerator = (currentNumerator % denominator) * 10;
        yield ~~(currentNumerator / denominator);
    }
}

const executeNumericalCalculations = (rawInputContent) => {
    const numericTokens = rawInputContent
        .split(/\s/)
        .map(Number);

    const groupedTriplets = segmentArrayIntoChunks(numericTokens, 3);

    const calculatedOutcomes = groupedTriplets.map(currentGroup => {
        const [firstOperand, secondOperand, repetitionCount] = currentGroup;

        // Replicate original loop termination behavior for incomplete triplets
        // The original loop `for(...; c=i[j++];)` terminates if `c` is falsy (e.g., undefined).
        if (firstOperand === undefined || secondOperand === undefined || repetitionCount === undefined) {
            return null; // Mark for filtering
        }

        // Replicate original behavior for c=0 (or c=""), where sum is 0
        if (repetitionCount === 0) {
            return 0;
        }

        const digitProducer = generateFractionalDigits(firstOperand, secondOperand);
        let accumulatedSum = 0;
        for (let iteration = 0; iteration < repetitionCount; iteration++) {
            accumulatedSum += digitProducer.next().value;
        }
        return accumulatedSum;
    }).filter(result => result !== null); // Remove results from incomplete triplets

    return calculatedOutcomes;
};

const inputSourceData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const finalComputedResults = executeNumericalCalculations(inputSourceData);
finalComputedResults.forEach(outputValue => console.log(outputValue));
