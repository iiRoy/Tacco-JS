/**
 * This module orchestrates the processing of a data stream, specifically designed
 * to answer queries about the number of unique elements within specified sub-arrays.
 * It includes robust parsing, validation, and a clear separation of concerns.
 */

/**
 * Determines and returns the count of unique items present within a given array segment.
 * This utility function is crucial for identifying distinct values efficiently.
 *
 * @param {Array<string>} targetArraySegment The portion of the array to be analyzed for uniqueness.
 * @returns {number} The total tally of distinct items found within the segment.
 */
const retrieveDistinctCount = (targetArraySegment) => {
    // A preliminary check for null, undefined, or empty segments.
    // In such cases, there are no distinct elements to count.
    if (!targetArraySegment || targetArraySegment.length === 0) {
        return 0;
    }

    // A Set data structure is employed to keep track of all elements encountered so far.
    // Sets inherently store only unique values, making them ideal for this purpose.
    const uniqueElementsEncountered = new Set();
    let distinctItemSum = 0; // Initialize a counter for the unique items.

    // Iterate through each individual item residing in the provided array segment.
    for (const currentItemValue of targetArraySegment) {
        // If the current item has not yet been recorded in our set of unique elements,
        // it signifies a newly discovered distinct item.
        if (!uniqueElementsEncountered.has(currentItemValue)) {
            uniqueElementsEncountered.add(currentItemValue); // Add this item to the set.
            distinctItemSum++;                               // Increment our counter for distinct items.
        }
    }

    return distinctItemSum; // Deliver the final count of distinct items.
};


/**
 * This is the primary function responsible for managing the entire workflow:
 * reading raw input, parsing it into meaningful data, executing a series of queries,
 * and finally presenting the computed results.
 *
 * @param {string} incomingDataStream The complete raw string content read from the standard input source.
 */
const orchestrateQueryExecution = (incomingDataStream) => {

    // First, the entire input content is fragmented into an array, with each element
    // representing a single line from the original input.
    const dataLines = incomingDataStream.split("\n");

    // --- Initial Configuration Parsing ---
    // The very first line of input typically holds global configuration parameters.
    const configurationTokens = dataLines[0].split(' ');
    const declaredCollectionSize = parseInt(configurationTokens[0], 10); // Corresponds to the original 'n'
    const totalNumberOfQueries = parseInt(configurationTokens[1], 10);   // Corresponds to the original 'q'

    // Implement a basic validation check for the number of queries.
    // If it's not a valid non-negative number, the process should halt.
    if (isNaN(totalNumberOfQueries) || totalNumberOfQueries < 0) {
        // In a production scenario, an error message might be logged.
        // For this clone, we simply exit without further processing.
        return;
    }

    // --- Main Data Collection Parsing ---
    // The second line of input is expected to contain the primary collection of elements.
    const primaryElementCollection = dataLines[1].split(' '); // Corresponds to the original 'balls'

    // --- Query Processing Loop ---
    // An array is used to temporarily store the computed result for each query.
    // This allows for all results to be outputted at once at the end.
    const accumulatedResults = [];

    // Isolate only the lines that contain query instructions.
    // This improves clarity and avoids processing non-query lines within the loop.
    const queryDefinitionLines = dataLines.slice(2, 2 + totalNumberOfQueries);

    // A guard clause: if no query lines are present (e.g., totalNumberOfQueries was 0
    // or input was malformed), there's nothing to process.
    if (queryDefinitionLines.length === 0 && totalNumberOfQueries > 0) {
        // This scenario indicates a discrepancy: queries were expected but not found.
        return;
    }

    // Iterate through each individual query instruction line.
    for (const currentQueryInstruction of queryDefinitionLines) {
        const querySpecifiers = currentQueryInstruction.split(' ');

        // Parse the start and end indices for the current query.
        const queryBeginIndex = parseInt(querySpecifiers[0], 10); // Corresponds to the original 's'
        const queryEndIndex = parseInt(querySpecifiers[1], 10);   // Corresponds to the original 'e'

        // Basic validation for query indices: ensure they are valid positive numbers.
        // If invalid, this particular query is skipped.
        if (isNaN(queryBeginIndex) || isNaN(queryEndIndex) || queryBeginIndex <= 0 || queryEndIndex <= 0) {
            continue; // Move to the next query instruction.
        }

        // Adjust the 1-based indices from the input to 0-based indices
        // required for JavaScript array methods like `slice()`.
        // The `slice()` method's end argument is exclusive, so `queryEndIndex` is used directly.
        const effectiveStartForSlice = queryBeginIndex - 1;
        const effectiveEndForSlice = queryEndIndex;

        // Boundary check: Ensure the adjusted indices fall within the valid range
        // of the primary element collection. Invalid queries are skipped.
        if (effectiveStartForSlice < 0 || effectiveEndForSlice > primaryElementCollection.length || effectiveStartForSlice >= effectiveEndForSlice) {
            continue; // Skip queries that would result in an invalid or empty slice.
        }

        // Extract the relevant sub-segment of the element collection for the current query.
        const segmentToAnalyze = primaryElementCollection.slice(effectiveStartForSlice, effectiveEndForSlice);

        // Utilize the helper function to compute the number of distinct elements
        // within the extracted segment.
        const uniqueElementCountInSegment = retrieveDistinctCount(segmentToAnalyze);

        // Store the computed count.
        accumulatedResults.push(uniqueElementCountInSegment);
    }

    // --- Final Output Generation ---
    // Present all the accumulated results. Each result is printed on a new line,
    // faithfully replicating the original output format.
    for (const individualResult of accumulatedResults) {
        console.log(individualResult);
    }
};

// The entry point of the script: read the content from standard input (stdin)
// using Node.js's file system module, and then initiate the query processing.
orchestrateQueryExecution(require("fs").readFileSync("/dev/stdin", "utf8"));