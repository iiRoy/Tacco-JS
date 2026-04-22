/*
 * This JavaScript module is designed to process a numerical data stream.
 * It computes a special aggregated sum from a sequence of values,
 * following a specific pattern involving the first, second-to-last,
 * and intermediate minimums of adjacent pairs.
 *
 * This kind of calculation can be found in various algorithms,
 * such as those related to path optimization, structural component analysis,
 * or dynamic programming problems where segment interactions are key.
 */
function processNumericalSeries(sourceDataset) {
    // A robust check for the integrity of the input dataset.
    // If the input is not an array or is completely empty, an error message is displayed,
    // and the function terminates prematurely, preventing further execution with invalid data.
    if (!Array.isArray(sourceDataset) || sourceDataset.length === 0) {
        console.error("Input data stream is either malformed or empty. Processing aborted.");
        return; // Halt execution if initial data is invalid.
    }

    // The initial element of the dataset specifies the count of relevant numerical items.
    // Using the unary plus operator for type coercion to number, which is a concise alternative to parseInt.
    const effectiveItemCount = +sourceDataset[0];

    // Validate that the extracted count is a non-negative number.
    // A negative or non-numeric count indicates an issue with the input structure.
    if (Number.isNaN(effectiveItemCount) || effectiveItemCount < 0) {
        console.error("The specified item count is invalid (not a number or negative). Processing aborted.");
        return;
    }

    // Transform the remainder of the dataset into a sequence of numbers.
    // The `slice(1)` method creates a new array containing all elements except the first.
    // The `map` function then applies the unary plus operator to each string element, converting it to a number.
    const valueSequence = sourceDataset.slice(1).map(itemString => +itemString);

    // Initialize the aggregate sum variable. Starting from zero provides a clear baseline.
    let cumulativeTotal = 0;

    // Handle trivial cases for the effective item count.
    // If there are no items to process (count is 0), the total is zero.
    if (effectiveItemCount === 0) {
        console.log(0);
        return;
    }

    // For a single item, the sum is simply that item's value.
    // This is an explicit guard clause for clarity, though the general logic would also handle it.
    if (effectiveItemCount === 1) {
        // Ensure the valueSequence actually contains the expected single element.
        if (valueSequence.length > 0) {
            cumulativeTotal = valueSequence[0];
        }
        console.log(cumulativeTotal);
        return;
    }

    // Accumulate the value of the first element in the sequence.
    // This forms the initial component of our calculated sum.
    cumulativeTotal += valueSequence[0];

    // If there are at least two elements, the second-to-last element also contributes directly to the sum.
    // The index for this element is `effectiveItemCount - 2`.
    // This handles the `B[N-2]` part of the original logic for N > 1.
    const penultimateElementIndex = effectiveItemCount - 2;
    // An additional check to ensure index validity, though `valueSequence.length` should match `effectiveItemCount`
    // when the input is well-formed.
    if (penultimateElementIndex >= 0 && penultimateElementIndex < valueSequence.length) {
        cumulativeTotal += valueSequence[penultimateElementIndex];
    }

    // Iterate through the sequence to sum the minimums of adjacent pairs.
    // This loop runs from the first pair (index 0 and 1) up to the pair
    // just before the second-to-last element (index `N-3` and `N-2`).
    // The upper bound `effectiveItemCount - 2` ensures we don't go out of bounds
    // and correctly capture all intermediate minimums.
    const loopUpperBound = effectiveItemCount - 2;
    for (let currentSegmentPointer = 0; currentSegmentPointer < loopUpperBound; currentSegmentPointer++) {
        const leftSegmentValue = valueSequence[currentSegmentPointer];
        const rightSegmentValue = valueSequence[currentSegmentPointer + 1];
        const smallerOfAdjacent = Math.min(leftSegmentValue, rightSegmentValue);
        cumulativeTotal += smallerOfAdjacent; // Add the determined minimum to the running total.
    }

    // Output the final computed aggregate value.
    console.log(cumulativeTotal);
}

// Entry point for execution: Reads data from standard input.
// The `readFileSync` method gets the raw content.
// `.trim()` removes any leading/trailing whitespace.
// `.split(/\n|\s/)` divides the string into segments by newlines or spaces.
// `.filter(s => s !== '')` removes any empty string segments that might result from multiple delimiters.
const rawInputPayload = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const processedInputSegments = rawInputPayload.split(/\n|\s/).filter(s => s !== '');

// Invoke the main processing function with the prepared input segments.
processNumericalSeries(processedInputSegments);