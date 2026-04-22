const processInputContent = (rawTextContent) => {
    const dataLines = rawTextContent.trim().split('\n');
    const numberTokens = dataLines[1].split(' ');
    const parsedNumericalElements = numberTokens.map(Number);
    return parsedNumericalElements;
};

const determineUniqueNonMultiples = (sourceCollection) => {
    const orderedDistinctValues = Array.from(new Set(sourceCollection)).sort((valA, valB) => valA - valB);

    const finalRetainedValues = orderedDistinctValues.filter(currentValue => {
        // Special handling for zero:
        // In the original code, a number X (currentValue) is marked as a multiple
        // of Y (otherValue) only if X % Y === 0.
        // If Y is 0, X % 0 results in NaN, so X % 0 === 0 is false.
        // This means 0 can never act as a divisor to mark other numbers.
        // If X is 0 and Y is positive, 0 % Y === 0 is true.
        // However, due to the sorting and the loop structure, 0 will always be A[i] first.
        // A[i] (the current divisor) is only marked -1 if it has duplicates.
        // Since Set handles duplicates, if 0 is present, it's effectively unique in `orderedDistinctValues`.
        // Thus, 0 will not be marked -1 by its own duplicates.
        // 0 as A[i] will not mark other A[j] as -1.
        // 0 as A[j] will not be marked -1 by any A[i] because A[i] cannot be negative (array values are positive integers, or zero).
        // Therefore, if 0 is present in the input, it always contributes to the count.
        if (currentValue === 0) {
            return true;
        }

        // For non-zero numbers:
        // A 'currentValue' survives if it is not a multiple of any 'otherValue'
        // in the set (excluding itself and excluding 0 as a divisor).
        return !orderedDistinctValues.some(otherValue =>
            otherValue !== currentValue &&
            otherValue !== 0 &&
            currentValue % otherValue === 0
        );
    });
    return finalRetainedValues.length;
};

const entryPoint = (inputData) => {
    const initialRawNumbers = processInputContent(inputData);
    const finalCount = determineUniqueNonMultiples(initialRawNumbers);
    console.log(finalCount);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));