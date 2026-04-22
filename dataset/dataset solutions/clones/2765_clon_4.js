const processInputAndCalculate = (sourceInformation) => {
    const KEY_DIVISOR = 2019;
    const valueRange = sourceInformation[0].split(" ");
    const lowerBoundary = parseInt(valueRange[0], 10);
    const upperBoundary = parseInt(valueRange[1], 10);

    // Determine if any multiple of KEY_DIVISOR falls within the inclusive range [lowerBoundary, upperBoundary].
    // This is equivalent to finding the smallest multiple of KEY_DIVISOR that is >= lowerBoundary,
    // and checking if that multiple is <= upperBoundary.
    const firstRelevantMultiple = Math.floor((lowerBoundary + KEY_DIVISOR - 1) / KEY_DIVISOR) * KEY_DIVISOR;

    if (firstRelevantMultiple <= upperBoundary) {
        // If a multiple of KEY_DIVISOR exists in the range, then 0 is one of the remainders.
        // The product of any two remainders, one of which is 0, will be 0.
        process.stdout.write("0\n");
    } else {
        // No multiple of KEY_DIVISOR exists in the range [lowerBoundary, upperBoundary].
        // This implies that the entire range [lowerBoundary, upperBoundary] falls within a single
        // "modulo block" of KEY_DIVISOR.
        // Consequently, the remainders (i % KEY_DIVISOR) for i in this range will be a contiguous
        // sequence of positive integers:
        // (lowerBoundary % KEY_DIVISOR), (lowerBoundary % KEY_DIVISOR) + 1, ..., (upperBoundary % KEY_DIVISOR).
        // The two smallest remainders will therefore be (lowerBoundary % KEY_DIVISOR) and
        // (lowerBoundary % KEY_DIVISOR) + 1.
        const smallestRemainder = lowerBoundary % KEY_DIVISOR;
        const secondSmallestRemainder = smallestRemainder + 1;
        process.stdout.write(String(smallestRemainder * secondSmallestRemainder) + "\n");
    }
};

const fileSystemReader = require('fs');
const acquiredData = fileSystemReader.readFileSync('/dev/stdin', 'UTF-8');
const processedData = acquiredData.trim().split("\n");

processInputAndCalculate(processedData);