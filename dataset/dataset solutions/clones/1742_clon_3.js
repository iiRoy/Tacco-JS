// A robust utility function designed to parse structured string input,
// extract numerical data, sort it, and then compute a cumulative sum
// of a specified number of the smallest values.
function DataProcessor(receivedPayload) {
    // --- Input Validation and Initial Parsing ---

    // Ensure the incoming data is a valid and non-empty string.
    // This acts as an early exit for malformed or missing input.
    if (!receivedPayload || typeof receivedPayload !== 'string' || receivedPayload.trim() === '') {
        console.error("Error: Input payload is invalid, null, or empty. Cannot proceed with processing.");
        return; // Terminate execution gracefully.
    }

    // Split the entire payload into individual lines for easier processing.
    const payloadLines = receivedPayload.split('\n');

    // Validate that we have at least two lines of data as expected.
    if (payloadLines.length < 2) {
        console.error("Error: Insufficient data lines provided in the payload. Expected at least two lines.");
        return;
    }

    // --- Configuration Extraction from the First Line ---

    // The first line contains configuration tokens, separated by spaces.
    const firstLineSegments = payloadLines[0].split(' ');

    // Extract the string representation of the subset size (originally 'k').
    // We're ignoring the 'n' value from the first line as the actual count
    // of items will be determined dynamically from the second line.
    const subsetCountStr = firstLineSegments[1];
    const subsetSelectionLimit = parseInt(subsetCountStr, 10); // Use radix 10 for explicit decimal parsing.

    // Validate the parsed subset selection limit. It must be a non-negative integer.
    if (isNaN(subsetSelectionLimit) || subsetSelectionLimit < 0) {
        console.error(`Error: Invalid subset selection limit '${subsetCountStr}'. Must be a non-negative integer.`);
        return;
    }

    // --- Numerical Data Extraction from the Second Line ---

    // The second line contains the raw string values for the items, space-separated.
    const rawValueStrings = payloadLines[1].split(' ');

    // Define a constant for the decimal radix to improve readability and maintainability.
    const DECIMAL_RADIX = 10;

    // Convert each string value into an integer. The `map` method provides a concise way
    // to transform array elements.
    const numericalItems = rawValueStrings.map(str => parseInt(str, DECIMAL_RADIX));

    // Filter out any values that failed parsing (e.g., non-numeric strings)
    // resulting in NaN (Not-a-Number). This ensures only valid numbers are processed.
    const validNumericalItems = numericalItems.filter(num => !isNaN(num));

    // If no valid numerical items were found after parsing and filtering, log a warning
    // and exit, as there's nothing to sum.
    if (validNumericalItems.length === 0) {
        console.warn("Warning: No valid numerical items were found after parsing. Outputting 0 as sum.");
        console.log(0);
        return;
    }

    // --- Sorting the Numerical Data ---

    // Define a custom comparison function for sorting numbers in ascending order.
    // This is more verbose than `a - b` but explicitly shows the comparison logic.
    const ascendingComparator = (valueA, valueB) => {
        if (valueA < valueB) {
            return -1; // valueA should come before valueB
        } else if (valueA > valueB) {
            return 1;  // valueA should come after valueB
        }
        return 0;      // values are considered equal
    };

    // Create a shallow copy of the array using the spread operator before sorting.
    // This ensures that the original `validNumericalItems` array remains unchanged.
    const orderedNumericalItems = [...validNumericalItems].sort(ascendingComparator);

    // Optional: Log a snippet of the sorted array for debugging or insight into the process.
    console.log(`Debug: Sorted items (first 5): ${orderedNumericalItems.slice(0, 5).join(', ')}...`);

    // --- Calculating the Cumulative Sum ---

    // Determine the actual number of items to sum. This handles cases where
    // `subsetSelectionLimit` might be larger than the available items.
    const actualSelectionCount = Math.min(subsetSelectionLimit, orderedNumericalItems.length);

    // Provide a warning if the requested subset size exceeds the available items,
    // and adjust to sum all available items.
    if (subsetSelectionLimit > orderedNumericalItems.length) {
        console.warn(`Warning: Requested subset size (${subsetSelectionLimit}) exceeds the number of available items (${orderedNumericalItems.length}). Summing all available items.`);
    }

    // If no items can be selected (e.g., subsetSelectionLimit was 0, or array became empty),
    // output 0 and exit.
    if (actualSelectionCount === 0) {
        console.log(0);
        return;
    }

    let accumulatedTotal = 0; // Initialize the variable to store the final sum.

    // Iterate through the first `actualSelectionCount` elements of the sorted array
    // and add them to the accumulated total.
    for (let currentIdx = 0; currentIdx < actualSelectionCount; currentIdx++) {
        accumulatedTotal += orderedNumericalItems[currentIdx];
    }

    // --- Final Output ---

    // Display the final computed sum to the standard output.
    console.log(accumulatedTotal);
}


// The following line handles the standard input/output mechanism.
// It reads the entire content from /dev/stdin as a UTF-8 string
// and passes it to the DataProcessor function.
// This part is typically left untouched in competitive programming setups.
DataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));