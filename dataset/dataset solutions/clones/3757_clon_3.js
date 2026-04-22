// This module is designed to meticulously process a multi-line string of raw input data.
// It extracts configuration parameters, parses numerical values from subsequent lines,
// computes sums for each parsed item, and then aggregates a specific subset of these sums.
function processInputData(rawDataString) {
    // Implement an initial validation step to ensure the input string is not empty or malformed.
    // If the raw data is absent or consists only of whitespace, an error is logged, and a default result of 0 is returned.
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Input data string is either empty, not a string, or contains only whitespace. Cannot proceed.");
        return 0;
    }

    // Divide the entire input string into an array of individual line segments.
    // This allows for sequential processing of configuration and item data.
    const allLineSegments = rawDataString.split('\n');

    // Validate the presence and content of the first line, which is expected to contain configuration details.
    if (allLineSegments.length === 0 || allLineSegments[0].trim() === '') {
        console.error("The configuration line is missing or empty. Input format violation.");
        return 0;
    }

    // Parse the primary configuration parameters from the first line.
    // The first element typically denotes the total number of data items (N),
    // and the second specifies the count of items to select for summation (K).
    const configurationParts = allLineSegments[0].split(' ');
    // Use Number() for explicit type conversion and better error handling than parseInt() alone.
    const totalItemsToProcess = Number(configurationParts[0]); // Represents 'N' from original problem context
    const selectionCountLimit = Number(configurationParts[1]);   // Represents 'K' from original problem context

    // Introduce a guard clause for the selection limit. If 'K' is non-numeric or zero,
    // the final sum will inherently be zero, and we can exit early.
    if (isNaN(selectionCountLimit) || selectionCountLimit === 0) {
        // Output 0 to the console, matching the original program's behavior for K=0.
        console.log(0);
        return 0; // Explicitly return 0 to the caller function.
    }

    // Initialize an array to store the parsed numerical values for each data item.
    // Each element in this array will itself be an array of numbers.
    let itemDataMatrix = [];

    // Iterate through the input lines, starting from the second line (index 1),
    // up to the 'totalItemsToProcess' count as indicated by the configuration.
    for (let currentLineIndex = 0; currentLineIndex < totalItemsToProcess; currentLineIndex++) {
        const currentItemRawLine = allLineSegments[currentLineIndex + 1]; // +1 to skip the config line

        // Perform robust validation for each item line. Skip or handle lines that are empty or invalid.
        if (!currentItemRawLine || currentItemRawLine.trim() === '') {
            console.warn(`Line ${currentLineIndex + 2} (item data) was empty or invalid. Treating as an item with no values.`);
            itemDataMatrix.push([]); // Add an empty array for this item to maintain structure.
            continue;
        }

        // Process the current item line: split by spaces, filter out any empty strings,
        // and convert each segment into a number. Validate each conversion.
        const parsedNumericValues = currentItemRawLine
            .split(' ')
            .filter(segment => segment.trim() !== '') // Remove any accidental empty strings from splitting.
            .map(stringValue => {
                const numericalValue = Number(stringValue);
                // If a segment cannot be converted to a number, log a warning and treat it as 0.
                if (isNaN(numericalValue)) {
                    console.warn(`Non-numeric value detected: "${stringValue}" in line "${currentItemRawLine}". Using 0 instead.`);
                    return 0;
                }
                return numericalValue;
            });
        itemDataMatrix.push(parsedNumericValues);
    }

    // Define a reusable helper function to calculate the sum of numbers within any given array.
    // This promotes code reuse and clarity.
    const calculateSumOfArrayElements = (numericArray) => {
        // Guard against non-array inputs or empty arrays.
        if (!Array.isArray(numericArray) || numericArray.length === 0) {
            return 0;
        }
        let runningTotal = 0;
        for (const singleValue of numericArray) {
            runningTotal += singleValue;
        }
        return runningTotal;
    };

    // Compute the sum of values for each individual item using the helper function.
    let aggregatedItemTotals = [];
    for (const itemValueList of itemDataMatrix) {
        aggregatedItemTotals.push(calculateSumOfArrayElements(itemValueList));
    }

    // Sort the calculated item totals. The original code's `l < r` in sort resulted in
    // descending order (largest values first). We replicate this behavior to pick the top K largest sums.
    aggregatedItemTotals.sort((valueA, valueB) => valueB - valueA); // Descending order sort.

    // Select the 'selectionCountLimit' number of largest sums.
    // Implement this with a manual loop for clarity and to avoid direct `slice` if `selectionCountLimit` is large.
    let topSelectedSums = [];
    // Ensure we don't attempt to select more items than are actually available in the sorted list.
    const actualItemsToSelect = Math.min(selectionCountLimit, aggregatedItemTotals.length);

    for (let i = 0; i < actualItemsToSelect; i++) {
        topSelectedSums.push(aggregatedItemTotals[i]);
    }

    // Finally, calculate the cumulative sum of these selected largest values.
    const finalAccumulatedValue = calculateSumOfArrayElements(topSelectedSums);

    // Output the final result to the standard console.
    console.log(finalAccumulatedValue);

    // Return the computed value, allowing for potential external use or testing.
    return finalAccumulatedValue;
}

/*
* This section facilitates interaction with the standard input/output streams.
* It is crucial not to alter this part, as it ensures the code's compatibility
* with typical competitive programming environments. It reads all data from
* /dev/stdin and passes it to the primary processing function.
*/
const inputContentFromFile = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(inputContentFromFile);