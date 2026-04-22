(function(rawInputData) {
    // This JavaScript module is designed to process numerical data provided as a multi-line string.
    // Its primary goal is to determine the count of common numerical values between two distinct collections.
    // The input format is strictly defined:
    // Line 1: An integer representing the total number of elements in the initial data set (N).
    // Line 2: N space-separated integers forming the initial data set.
    // Line 3: An integer representing the total number of elements in the query data set (Q).
    // Line 4: Q space-separated integers forming the query data set.

    // Begin by segmenting the entire raw input string into an array of individual lines.
    // This simplifies subsequent parsing operations, allowing sequential consumption.
    const dataLines = rawInputData.split('\n');

    // Retrieve and parse the expected size of the first collection.
    // The .shift() method removes the first element from the array and returns it,
    // effectively moving to the next line for subsequent operations.
    const firstCollectionSizeString = dataLines.shift();
    const primaryCollectionCapacity = Number(firstCollectionSizeString);

    // Implement a basic validation check for the parsed capacity of the primary collection.
    // If it's not a valid non-negative number, an error is logged, and execution terminates.
    if (Number.isNaN(primaryCollectionCapacity) || primaryCollectionCapacity < 0) {
        console.error("Error: Invalid or non-positive size provided for the primary data collection.");
        return; // Exit the function to prevent further processing with bad data.
    }

    // Process the line containing the elements for the primary collection.
    // These elements are converted to a Set for optimized lookup performance (average O(1)).
    const primaryElementsLine = dataLines.shift();
    const mainDataSet = new Set(
        primaryElementsLine
            .split(' ')
            .slice(0, primaryCollectionCapacity) // Ensure we respect the declared size.
            .map(elementString => Number(elementString))
            .filter(numVal => !Number.isNaN(numVal)) // Exclude any non-numeric values that might arise from parsing.
    );

    // Retrieve and parse the expected size of the second collection (the query targets).
    const secondCollectionSizeString = dataLines.shift();
    const queryCollectionCapacity = Number(secondCollectionSizeString);

    // Apply similar validation for the query collection's capacity.
    if (Number.isNaN(queryCollectionCapacity) || queryCollectionCapacity < 0) {
        console.error("Error: Invalid or non-positive size provided for the query data collection.");
        return;
    }

    // Process the line containing the elements for the query collection.
    // These elements are stored in an array as they will be iterated over.
    const queryElementsLine = dataLines.shift();
    const targetQueryElements = queryElementsLine
        .split(' ')
        .slice(0, queryCollectionCapacity) // Adhere to the declared size.
        .map(elementString => Number(elementString))
        .filter(numVal => !Number.isNaN(numVal)); // Again, filter out invalid numbers.

    // Initialize a counter to keep track of how many query elements are found within the main data set.
    let totalMatchesFound = 0;

    // Iterate through each element in the `targetQueryElements` array.
    // A `for...of` loop is used for cleaner iteration over array elements.
    for (const currentTargetValue of targetQueryElements) {
        // Optional: Skip processing if a query target itself is an invalid number.
        if (Number.isNaN(currentTargetValue)) {
            continue; // Move to the next target without attempting a lookup.
        }

        // Perform the lookup: check if the current target value exists in the `mainDataSet` Set.
        // The `Set.prototype.has()` method provides an efficient means of checking for element presence.
        const isValueContained = mainDataSet.has(currentTargetValue);

        // If the current query target is found in the primary data set, increment our match counter.
        if (isValueContained) {
            totalMatchesFound++;
        }
    }

    // Output the final tally of common elements.
    // The output includes a descriptive string for enhanced clarity.
    console.log(`The total number of shared values identified is: ${totalMatchesFound}`);

// This Immediately Invoked Function Expression (IIFE) is designed to execute immediately.
// It retrieves its initial input by synchronously reading the contents of '/dev/stdin'
// (standard input) as a UTF-8 encoded string, which is common in competitive programming environments.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));