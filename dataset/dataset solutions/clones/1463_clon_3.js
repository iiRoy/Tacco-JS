// This immediately invoked function expression (IIFE) serves as the entry point
// for processing the input data, mimicking the original script's execution context.
((sourceDataString) => {
    // A crucial initial guard clause: ensure that the input data is not empty or invalid.
    // This prevents errors from attempting to process non-existent data.
    if (!sourceDataString || sourceDataString.trim() === '') {
        console.error("Error: No valid input data was provided. Please check the source.");
        return; // Terminate execution if input is missing.
    }

    /**
     * Helper function to safely extract and parse a single numeric value from the data stream.
     * It handles potential empty lines and non-numeric content gracefully.
     * @param {string[]} lineDataQueue - An array of strings, where each string is a line of input.
     * @returns {number} The parsed numeric value, or 0 if parsing fails or line is empty.
     */
    const extractNumericValue = (lineDataQueue) => {
        // Retrieve the next line from the queue. `shift()` removes the first element.
        const rawLineContent = lineDataQueue.shift();

        // Validate if a line was actually obtained.
        if (rawLineContent === undefined || rawLineContent.trim() === '') {
            console.error("Warning: Expected a numeric line but received empty or undefined data.");
            return 0; // Return a default value to prevent further errors.
        }

        // Attempt to convert the line content into a number.
        const parsedNumericalValue = Number(rawLineContent);

        // Validate if the conversion was successful.
        if (isNaN(parsedNumericalValue)) {
            console.error(`Error: Failed to parse '${rawLineContent}' into a valid number.`);
            return 0; // Return a default value upon parsing failure.
        }
        return parsedNumericalValue;
    };

    /**
     * Helper function to parse a line containing space-separated numbers into an array.
     * It also incorporates robust handling for expected array sizes.
     * @param {string[]} lineDataQueue - An array of strings representing input lines.
     * @param {number} expectedElementCount - The anticipated number of elements in the array.
     * @returns {number[]} An array of parsed numbers.
     */
    const extractNumericArray = (lineDataQueue, expectedElementCount) => {
        const rawArrayLine = lineDataQueue.shift();

        if (rawArrayLine === undefined || rawArrayLine.trim() === '') {
            console.error("Warning: Expected an array line but received empty or undefined data.");
            return []; // Return an empty array as a fallback.
        }

        // Split the line by spaces and then convert each part to a number.
        // Crucially, `slice(0, expectedElementCount)` is used to ensure we only
        // process up to the `expectedElementCount` elements, matching the
        // behavior of `split(' ', n)` in the original code for robustness.
        const processedNumericArray = rawArrayLine.split(' ').slice(0, expectedElementCount).map(Number);

        // Optional: Log a warning if the actual parsed count doesn't match the expectation.
        if (processedNumericArray.length !== expectedElementCount) {
             console.warn(`Note: Array length mismatch. Expected ${expectedElementCount} elements, but parsed ${processedNumericArray.length}.`);
        }

        return processedNumericArray;
    };

    /**
     * Core function responsible for processing the collections and determining common elements.
     * This function encapsulates the main business logic, enhancing modularity.
     * @param {string} fullInputString - The entire raw input as a single string.
     */
    const processElementIntersectionCount = (fullInputString) => {
        // Divide the entire input string into an array of individual lines.
        // This array acts as a mutable queue for sequential processing.
        const parsedInputLines = fullInputString.split('\n');

        // --- Step 1: Parse the first collection's metadata and elements ---
        // Retrieve the stated size for the primary collection.
        const primaryCollectionDesiredSize = extractNumericValue(parsedInputLines);

        // Extract and parse the elements for the main collection.
        const mainCollectionRawElements = extractNumericArray(parsedInputLines, primaryCollectionDesiredSize);

        // Type III Optimization: Convert the main collection into a Set for highly efficient lookups.
        // A Set provides average O(1) time complexity for `has()` operations,
        // which is a significant performance improvement over Array's O(N) `indexOf()`.
        const mainCollectionLookupSet = new Set(mainCollectionRawElements);

        // --- Step 2: Parse the second collection's metadata and elements ---
        // Retrieve the stated size for the query collection.
        const queryCollectionDesiredSize = extractNumericValue(parsedInputLines);

        // Extract and parse the elements that need to be searched for.
        const elementsToSearchAgainst = extractNumericArray(parsedInputLines, queryCollectionDesiredSize);

        // Initialize a variable to keep track of the total number of matches found.
        // Using `let` as its value will be iteratively updated.
        let totalIdenticalElementsFound = 0;

        // --- Step 3: Execute the core intersection logic ---
        // Iterate through each element in the query collection.
        // A `for...of` loop is used for cleaner iteration over iterable objects.
        for (const currentQueryItem of elementsToSearchAgainst) {
            // Check if the current query element exists within our optimized lookup set.
            if (mainCollectionLookupSet.has(currentQueryItem)) {
                // If a match is found, increment the counter.
                totalIdenticalElementsFound++;
            }
        }

        // Output the final count of common elements to the console.
        console.log(totalIdenticalElementsFound);
    };

    // Invoke the main processing function with the raw input string.
    processElementIntersectionCount(sourceDataString);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of standard input as a UTF-8 string.