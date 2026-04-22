/**
 * A utility function to safely acquire raw input data from standard input.
 * In a production environment, robust error handling or configuration for input source
 * would be implemented here.
 * @returns {string} The raw content read from /dev/stdin.
 */
const acquireSourceData = () => {
    try {
        // Attempt to read data synchronously from the standard input file descriptor.
        return require('fs').readFileSync("/dev/stdin", "utf-8");
    } catch (ioError) {
        // Log the error and terminate the process if input cannot be read.
        console.error("Input Acquisition Error: Unable to read from /dev/stdin.", ioError.message);
        // A non-zero exit code indicates an error.
        process.exit(1);
    }
};

/**
 * Orchestrates the processing of numerical sequences based on specific median logic.
 * This function handles parsing, validation, sorting, and applying a conditional transformation
 * to each element of the input sequence.
 * @param {string} rawContent - The complete string content received from the input source.
 */
function ProcessNumericalSequence(rawContent) {
    // Split the raw input into individual lines, discarding any truly empty lines.
    const contentLines = rawContent.split('\n').filter(segment => segment.trim() !== '');

    // --- Input Validation Phase ---

    // Ensure there are at least two valid lines for processing (count and sequence).
    if (contentLines.length < 2) {
        console.error("Processing Error: Insufficient data lines. Expected at least two non-empty lines.");
        return; // Halt execution if input is malformed.
    }

    // Parse the first line to determine the expected number of elements.
    // Using Number() for type conversion, and trim() for whitespace robustness.
    const expectedElementCount = Number(contentLines[0].trim());

    // Validate the parsed count: must be a positive, even integer.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0 || expectedElementCount % 2 !== 0) {
        console.error(`Processing Error: Invalid element count specified. Expected a positive, even integer, but received "${contentLines[0].trim()}".`);
        return;
    }

    // Parse the second line into an array of numbers.
    // Splitting by one or more whitespace characters ensures robustness.
    // Filter(Boolean) removes any empty strings that might result from multiple spaces.
    const originalNumberCollection = contentLines[1].split(/\s+/).filter(Boolean).map(Number);

    // Validate that all parsed elements are indeed numbers.
    if (originalNumberCollection.some(item => isNaN(item))) {
        console.error(`Processing Error: Non-numeric values found in the sequence: "${contentLines[1]}". All elements must be numbers.`);
        return;
    }

    // Final validation for the count: check if the actual number of elements matches the expectation.
    if (originalNumberCollection.length !== expectedElementCount) {
        console.error(`Processing Error: Element count mismatch. Declared ${expectedElementCount} elements, but found ${originalNumberCollection.length}.`);
        return;
    }

    // --- Core Logic Phase ---

    // Create an independent, sorted copy of the number collection.
    // The spread operator `...` ensures a shallow copy before sorting, preserving the original array.
    const sortedNumericSet = [...originalNumberCollection].sort((valA, valB) => {
        // Standard numerical ascending sort comparator.
        return valA - valB;
    });

    // Determine the indices for the two "median" candidates.
    // Since `expectedElementCount` is guaranteed to be even and positive, these indices are valid.
    const midPointIndexBase = expectedElementCount / 2;
    const lowerMidpointIndex = midPointIndexBase - 1; // Equivalent to N/2 - 1
    const upperMidpointIndex = midPointIndexBase;     // Equivalent to N/2

    // Extract the specific values from the sorted set at these calculated indices.
    const firstMedianCandidate = sortedNumericSet[lowerMidpointIndex];
    const secondMedianCandidate = sortedNumericSet[upperMidpointIndex];

    // --- Transformation and Output Phase ---

    // An array to accumulate the results of the transformation before printing.
    const transformedOutputValues = [];

    // Iterate through each element of the *original*, unsorted collection.
    for (const currentElement of originalNumberCollection) {
        let resultantValue;
        // Apply the conditional logic: if the current element is less than or
        // equal to the first median candidate, use the second; otherwise, use the first.
        if (currentElement <= firstMedianCandidate) {
            resultantValue = secondMedianCandidate;
        } else {
            resultantValue = firstMedianCandidate;
        }
        transformedOutputValues.push(resultantValue);
    }

    // Print each transformed value on a new line.
    transformedOutputValues.forEach(valueToPrint => console.log(valueToPrint));
}

// --- Program Entry Point ---
// Fetch the raw input content and then initiate the primary processing function.
const rawInputContent = acquireSourceData();
ProcessNumericalSequence(rawInputContent);