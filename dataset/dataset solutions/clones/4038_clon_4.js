const acquireSourceMaterial = (useSampleContent) => {
    if (useSampleContent) {
        // This content precisely matches the output of the original Debug function's string processing.
        return `5
        3 1 4 1 5
        2 7 1 8 2`;
    } else {
        // For a live execution environment, this would read from standard input.
        const fileSystemModule = require('fs');
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    }
};

const initiateProcessing = () => {
    // Control whether to use the hardcoded sample data or live input.
    // Set to 'true' to replicate the original 'debug' mode.
    const useTestingData = true;
    const rawSource = acquireSourceMaterial(useTestingData);

    // Split raw input into lines, then clean leading/trailing whitespace from each.
    const processedLines = rawSource.split(/\r?\n/).map(line => line.trim());

    // Extract the count of elements from the first line.
    const elementCount = Number(processedLines[0]);

    // Parse number arrays: split by space, filter out any empty strings resulting from multiple spaces,
    // convert to numbers, and finally sort them numerically.
    const setA = processedLines[1].split(' ').filter(segment => segment !== '').map(Number).sort((valX, valY) => valX - valY);
    const setB = processedLines[2].split(' ').filter(segment => segment !== '').map(Number).sort((valX, valY) => valX - valY);

    // Utilize a functional reduction approach to compute the two required sums.
    // The accumulator stores 'deficit' (equivalent to original 'h') and 'advantage' (equivalent to original 'k').
    const computedTotals = Array.from({ length: elementCount }).reduce((accumulator, _, indexPosition) => {
        const valueFromA = setA[indexPosition];
        const valueFromB = setB[indexPosition];

        if (valueFromB < valueFromA) {
            accumulator.deficit += (valueFromA - valueFromB);
        } else if (valueFromB > valueFromA) {
            accumulator.advantage += Math.floor((valueFromB - valueFromA) / 2);
        }
        return accumulator;
    }, { deficit: 0, advantage: 0 }); // Initial state for the accumulator

    // Output the final decision based on the comparison of accumulated values.
    console.log(computedTotals.advantage >= computedTotals.deficit ? 'Affirmative' : 'Negative');
};

// Begin the data processing and calculation.
initiateProcessing();