const parseInputData = (incomingText) => {
    const contentLines = incomingText.trim().split('\n');
    const elementCount = Number(contentLines[0].split(' ')[0]);
    const numericValues = contentLines[1].split(' ').map(Number);
    return { elementCount, numericValues };
};

const calculatePrefixSums = (valueSequence) => {
    return valueSequence.reduce((acc, currentNumber) => {
        acc.push(acc[acc.length - 1] + currentNumber);
        return acc;
    }, [0]);
};

const findMinimumPartitionDifference = (totalElements, prefixSumArray) => {
    if (totalElements <= 1) {
        return 10e20; // Matches the initial 'diff' value in the original code for non-split scenarios
    }
    const allDifferences = Array.from({ length: totalElements - 1 }, (_, idx) => {
        const separationPoint = idx + 1; // Represents the index AFTER the first group
        const firstSegmentTotal = prefixSumArray[separationPoint];
        const secondSegmentTotal = prefixSumArray[totalElements] - firstSegmentTotal;
        return Math.abs(firstSegmentTotal - secondSegmentTotal);
    });
    return Math.min(...allDifferences);
};

const initiateProcessing = (rawPayload) => {
    const { elementCount, numericValues } = parseInputData(rawPayload);
    const cumulativeSums = calculatePrefixSums(numericValues);
    const finalDiscrepancy = findMinimumPartitionDifference(elementCount, cumulativeSums);
    console.log(finalDiscrepancy);
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));