const standardInputModule = require('readline');

let capturedInputLines = [];

const STDIN_STREAM = process.stdin;
const STDOUT_STREAM = process.stdout;

const consoleIOHandler = standardInputModule.createInterface({
    input: STDIN_STREAM,
    output: STDOUT_STREAM,
});

/**
 * Utility function to safely parse an array of string numbers into an array of integers.
 * Non-numeric values will be logged as warnings and treated as zero.
 * @param {string[]} stringArray - An array of strings, each expected to represent a number.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumericStrings(stringArray) {
    return stringArray.map(strValue => {
        const parsedNumber = parseInt(strValue, 10);
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Encountered non-numeric input '${strValue}'. Treating as 0.`);
            return 0;
        }
        return parsedNumber;
    });
}

/**
 * Simple comparison function for sorting numbers in ascending order.
 * @param {number} valueA
 * @param {number} valueB
 * @returns {number} A negative value if valueA < valueB, zero if equal, positive if valueA > valueB.
 */
const compareNumbersAscending = (valueA, valueB) => valueA - valueB;

consoleIOHandler.on('line', (currentInputLine) => {
    // Collect each line of input as it arrives.
    capturedInputLines.push(currentInputLine);
});

consoleIOHandler.on('close', () => {
    // --- Phase 1: Input Validation and Parameter Extraction ---

    if (capturedInputLines.length === 0) {
        console.error("Critical Error: No input lines were provided. Cannot perform calculations.");
        return; // Exit if no input.
    }

    // The first line contains our primary control parameters, N and M.
    const controlParameterLine = capturedInputLines.shift();
    const splitParameters = controlParameterLine.split(" ");

    if (splitParameters.length < 2) {
        console.error("Critical Error: First input line must contain two space-separated numbers (N and M).");
        return;
    }

    // N: Often represents the number of groups or segments to be formed/kept.
    const desiredSegmentsCount = parseInt(splitParameters[0], 10);
    // M: The total number of data points or items to process.
    const totalDataPointsCount = parseInt(splitParameters[1], 10);

    // Validate the extracted control parameters.
    if (isNaN(desiredSegmentsCount) || desiredSegmentsCount < 1) {
        console.error(`Critical Error: Invalid or non-positive value for N (${splitParameters[0]}). N must be a positive integer.`);
        return;
    }
    if (isNaN(totalDataPointsCount) || totalDataPointsCount < 1) {
        console.error(`Critical Error: Invalid or non-positive value for M (${splitParameters[1]}). M must be a positive integer.`);
        return;
    }

    // --- Phase 2: Data Points Acquisition and Preparation ---

    if (capturedInputLines.length === 0) {
        console.error("Critical Error: The line containing the actual data points is missing.");
        return;
    }

    // The next line in the collection holds the actual data points.
    const rawDataPointsLine = capturedInputLines[0];
    const stringDataPointTokens = rawDataPointsLine.split(" ");

    if (stringDataPointTokens.length < totalDataPointsCount) {
        console.error(`Critical Error: Expected ${totalDataPointsCount} data points, but only found ${stringDataPointTokens.length} in the input line.`);
        return;
    }

    // Parse the string tokens into numbers and ensure we only take the expected count.
    let processedDataPoints = parseNumericStrings(stringDataPointTokens.slice(0, totalDataPointsCount));

    // Sorting the data points is essential for calculating meaningful differences (gaps).
    processedDataPoints.sort(compareNumbersAscending);

    // --- Phase 3: Segment Lengths (Gaps) Calculation ---

    // This array will hold the lengths of segments between consecutive data points.
    // The problem's original logic includes a synthetic 'zero' segment at the beginning.
    let calculatedSegmentGaps = [];

    // Introduce the dummy zero segment as per the original algorithm's behavior.
    calculatedSegmentGaps.push(0);

    // Iterate through the sorted data points to compute the differences (gaps).
    // There are (totalDataPointsCount - 1) actual gaps between 'totalDataPointsCount' points.
    for (let i = 1; i < totalDataPointsCount; i++) {
        const currentGapLength = processedDataPoints[i] - processedDataPoints[i - 1];
        calculatedSegmentGaps.push(currentGapLength);
    }

    // Sort the segment gaps in ascending order to easily select the smallest ones later.
    calculatedSegmentGaps.sort(compareNumbersAscending);

    // --- Phase 4: Final Summation ---

    let finalComputedSum = 0;

    // The number of smallest gaps to sum is derived from M and N.
    // Original logic sums `M - (N - 1)` elements.
    const targetGapsToSum = totalDataPointsCount - desiredSegmentsCount + 1;

    // Determine the actual number of elements to iterate over, ensuring it's within bounds.
    // It should not be negative, nor exceed the actual number of gaps available.
    const effectiveIterationCount = Math.max(0, Math.min(targetGapsToSum, calculatedSegmentGaps.length));

    // Sum the smallest 'effectiveIterationCount' values from the sorted gaps.
    let iterationCounter = 0;
    while (iterationCounter < effectiveIterationCount) {
        finalComputedSum += calculatedSegmentGaps[iterationCounter];
        iterationCounter++;
    }

    // --- Phase 5: Output Result ---
    // Display the final accumulated value to standard output.
    console.log(finalComputedSum);
});