const INPUT_SOURCE_PATH = "/dev/stdin";
const DECIMAL_RADIX_BASE = 10;
const ONE_BASED_INDEX_ADJUSTMENT = 1;

// A robust utility function to parse string values into integers.
// It includes basic validation to handle non-numeric inputs gracefully,
// returning a default value and logging an error if parsing fails.
const ensureParsedInteger = (stringValue, defaultValue = 0) => {
    const parsedValue = parseInt(stringValue, DECIMAL_RADIX_BASE);
    if (isNaN(parsedValue)) {
        // In a production environment, one might throw an exception or use a more
        // sophisticated logging mechanism. For competitive programming, assuming
        // mostly valid input, this serves as a defensive check.
        console.error(`Error: Failed to parse integer from input string: "${stringValue}". Defaulting to ${defaultValue}.`);
        return defaultValue;
    }
    return parsedValue;
};

// --- Section 1: Input Data Acquisition ---
// Reads the entire content from the standard input synchronously.
// The input is expected to be line-delimited, so it's split into an array of strings.
const rawInputLines = require("fs").readFileSync(INPUT_SOURCE_PATH, "utf8").split("\n");

// --- Section 2: Primary Data Set Parsing ---
// The first line of the input file specifies the total count of primary data entries.
const dataEntryCountString = rawInputLines[0];
const totalDataEntries = ensureParsedInteger(dataEntryCountString);

// Initialize an array to store the primary data. Each element will be an array
// representing a [value, weight] pair, accessible by its 0-based index.
const primaryInformationStore = [];

// Populate the primary data store by iterating through the subsequent input lines.
// Data lines start from the second line (index 1) of the raw input.
for (let entryIndex = 0; entryIndex < totalDataEntries; ++entryIndex) {
    const currentEntryLine = rawInputLines[ONE_BASED_INDEX_ADJUSTMENT + entryIndex];

    // Basic validation: ensure the input line exists before attempting to process it.
    if (!currentEntryLine) {
        console.error(`Warning: Missing primary data entry line at expected index ${entryIndex}. Pushing default values.`);
        primaryInformationStore.push([0, 0]); // Add default values to maintain array structure
        continue;
    }

    const lineComponents = currentEntryLine.split(" ");
    const valuePart = ensureParsedInteger(lineComponents[0]);
    const weightPart = ensureParsedInteger(lineComponents[1]);

    primaryInformationStore.push([valuePart, weightPart]);
}

// --- Section 3: Query Specifications Parsing ---
// The line immediately following the primary data entries specifies the total number of queries.
const queryCountLineOffset = ONE_BASED_INDEX_ADJUSTMENT + totalDataEntries;
const queryCountString = rawInputLines[queryCountLineOffset];
const totalQueriesToProcess = ensureParsedInteger(queryCountString);

// Initialize an array to store all query specifications. Each element will be an array
// representing a [initial_traversal_key, maximum_weight_threshold] pair.
const querySpecificationsList = [];

// Populate the query specifications list. Query lines start after the query count line.
const queryLinesStartingIndex = queryCountLineOffset + ONE_BASED_INDEX_ADJUSTMENT;

for (let queryIteration = 0; queryIteration < totalQueriesToProcess; ++queryIteration) {
    const currentQueryRawLine = rawInputLines[queryLinesStartingIndex + queryIteration];

    // Basic validation: ensure the query input line exists.
    if (!currentQueryRawLine) {
        console.error(`Warning: Missing query specification line at expected index ${queryIteration}. Pushing default values.`);
        querySpecificationsList.push([0, 0]); // Add default values
        continue;
    }

    const queryParameters = currentQueryRawLine.split(" ");

    // The first parameter of a query is often 1-based in input, converting to 0-based for internal use.
    const startingTraversalKey = ensureParsedInteger(queryParameters[0]) - ONE_BASED_INDEX_ADJUSTMENT;
    const maxAllowedWeight = ensureParsedInteger(queryParameters[1]);

    // Ensure the initial traversal key is not negative, providing a safety net.
    const validatedTraversalKey = Math.max(0, startingTraversalKey);

    querySpecificationsList.push([validatedTraversalKey, maxAllowedWeight]);
}

// --- Section 4: Core Query Processing Function ---
// This function encapsulates the logic for traversing a data structure
// (conceptually similar to a segment tree or similar binary-indexed structure)
// and accumulating values based on a cumulative weight limit.
const executeWeightedTraversalQuery = (
    initialKeyForTraversal, // The starting index for the traversal.
    weightLimitThreshold,   // The maximum allowed cumulative weight.
    dataSource              // The array containing [value, weight] pairs.
) => {
    let currentKey = initialKeyForTraversal;
    let accumulatedResultValue = 0;
    let cumulativeWeightSum = 0;

    // The traversal loop continues as long as the cumulative weight does not exceed the threshold.
    // In each step, the current key is halved (integer division), moving towards the 'root' (index 0).
    for (
        ;
        cumulativeWeightSum <= weightLimitThreshold;
        currentKey = Math.floor(currentKey / 2) // Equivalent to a right bit-shift (currentKey >>= 1)
    ) {
        // Guard clause: Exit if the current key becomes invalid (negative) or exceeds the data source bounds.
        // The original logic implies traversal stops at 0, but this adds robustness.
        if (currentKey < 0 || currentKey >= dataSource.length) {
            break;
        }

        const dataEntry = dataSource[currentKey];
        // Defensive check: ensure the data entry at the current key actually exists.
        if (!dataEntry) {
            break;
        }

        const entryValue = dataEntry[0];
        const entryWeight = dataEntry[1];

        // Add the current entry's weight to the running cumulative total.
        cumulativeWeightSum += entryWeight;

        // Only add the entry's value to the result if the cumulative weight,
        // after adding the current entry's weight, is still within the specified limit.
        if (cumulativeWeightSum <= weightLimitThreshold) {
            accumulatedResultValue += entryValue;
        }

        // Critical break condition: stop the traversal once the 'root' node (index 0) is processed.
        if (currentKey === 0) {
            break;
        }
    }
    return accumulatedResultValue;
};

// --- Section 5: Execute All Queries and Output Results ---
// Iterate through each prepared query specification and apply the core traversal logic.
for (let currentQuerySpecificationIndex = 0; currentQuerySpecificationIndex < totalQueriesToProcess; ++currentQuerySpecificationIndex) {
    const currentQueryDetail = querySpecificationsList[currentQuerySpecificationIndex];
    const queryStartingKey = currentQueryDetail[0];
    const queryWeightLimit = currentQueryDetail[1];

    // Execute the query using the dedicated function and retrieve the calculated result.
    const queryResult = executeWeightedTraversalQuery(
        queryStartingKey,
        queryWeightLimit,
        primaryInformationStore
    );

    // Print the computed result for the current query to standard output.
    console.log(queryResult);
}