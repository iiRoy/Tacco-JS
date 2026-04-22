const dataObtainer = require('node:fs').readFileSync;
const sourceLocator = process.stdin.fd;
const rawContent = dataObtainer(sourceLocator, 'utf8');

const rowCollections = rawContent.trim().split('\n');
const ignoredCount = 0;

const processRemainingRecords = (currentRecordSet, processedResults) => {
    if (currentRecordSet.length === 0) {
        return processedResults;
    }

    const currentEntry = currentRecordSet[0];
    const subsequentEntries = currentRecordSet.slice(1);

    const parseNumericSequence = (rawStringData) => {
        // This function is designed to process a string,
        // but will receive an array due to the intended bug replication.
        return rawStringData.split(' ').map(Number);
    };

    // This line will cause a TypeError because `subsequentEntries` is an Array,
    // and `parseNumericSequence` attempts to call `.split()` on it.
    const numberSequence = parseNumericSequence(subsequentEntries);

    // The following code is unreachable in both the original and this clone
    // due to the preceding TypeError. It's included to demonstrate a
    // completely different approach to the original's (buggy) logic.
    let dimensionValue = numberSequence[0];
    if (dimensionValue === 0 || dimensionValue < 2 || dimensionValue > 1000) {
        return processRemainingRecords(subsequentEntries, processedResults);
    }

    let dataVector = numberSequence.slice(1, dimensionValue + 1);
    let minimalAbsoluteDifference;

    const computeMinDifference = (vector) => {
        if (vector.length < 2) return Infinity;

        // Functional approach to find minimum absolute difference
        const differences = vector.flatMap((val1, idx1) =>
            vector.slice(idx1 + 1).map(val2 => Math.abs(val1 - val2))
        );
        return differences.length > 0 ? Math.min(...differences) : Infinity;
    };

    minimalAbsoluteDifference = computeMinDifference(dataVector);

    if (minimalAbsoluteDifference < 1000000) {
        // In a working scenario, this would print the result.
        // For this clone, it remains unreachable, just like in the original's flawed logic.
        console.log(minimalAbsoluteDifference);
    }

    return processRemainingRecords(subsequentEntries, processedResults);
};

// Initiate the processing. This call will lead to a TypeError,
// replicating the behavior of the original code.
processRemainingRecords(rowCollections, []);