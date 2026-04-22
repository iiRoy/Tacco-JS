// This module is designed to process a multi-line input string, extract specific numerical data,
// and perform a unique count calculation based on that data.

/**
 * Analyzes a given data set string to compute a final numeric result.
 * It parses initial quantity from the first line and collects items from
 * subsequent specific lines, then deducts the count of unique collected items.
 * @param {string} sourceData - The raw input data as a single string,
 *                               where lines are separated by newline characters.
 * @returns {number} The calculated difference, or 0 if input is invalid.
 */
function AnalyzeDataSet(sourceData) {
    // Preliminary check to ensure the input data is a valid non-empty string.
    if (!sourceData || typeof sourceData !== 'string' || sourceData.trim() === '') {
        console.error("Input data is either missing, not a string, or contains only whitespace.");
        return 0; // Return a default value indicating an issue.
    }

    // Divide the comprehensive input string into an array of distinct lines.
    const dataLines = sourceData.split('\n');

    // Attempt to extract the primary numerical quantity from the very first line.
    // It's assumed to be the first space-separated token on that line.
    const initialLineParts = dataLines[0] ? dataLines[0].split(' ') : [];
    let initialQuantity = parseInt(initialLineParts[0], 10);

    // Validate the parsed numerical value. If it's not a valid number or is negative,
    // a warning is issued, and the quantity defaults to zero to prevent calculation errors.
    if (isNaN(initialQuantity) || initialQuantity < 0) {
        console.warn("The initial quantity from the first line was unparseable or negative. Proceeding with 0.");
        initialQuantity = 0;
    }

    // A temporary collection to hold all relevant identifiers extracted from specific data lines.
    let collectedIdentifiers = [];
    const lineProcessingInterval = 2; // Defines the step size for iterating through lines (e.g., every other line).
    const dataCollectionStartIndex = 2; // Specifies the array index from which data collection should commence.

    // Iterate through the lines of data, adhering to the specified start index and interval.
    for (let currentLineIdx = dataCollectionStartIndex; currentLineIdx < dataLines.length; currentLineIdx += lineProcessingInterval) {
        const activeLineContent = dataLines[currentLineIdx];

        // Only process lines that are not empty or solely whitespace.
        if (activeLineContent && activeLineContent.trim() !== '') {
            // Break down the current line into individual components (tokens) using space as a delimiter.
            const lineTokens = activeLineContent.split(' ');
            // Efficiently append all tokens from the current line to our main collection.
            collectedIdentifiers.push(...lineTokens);
        }
    }

    // Now, refine the collected identifiers by removing any duplicate entries.
    // This ensures each unique identifier is counted only once.
    const uniqueIdentifiersList = RemoveDuplicatesFromCollection(collectedIdentifiers);

    // Compute the final result by subtracting the count of unique identifiers
    // from the initial quantity obtained from the first line.
    const finalCalculatedResult = initialQuantity - uniqueIdentifiersList.length;

    // The computed result is returned as the output of this function.
    return finalCalculatedResult;
}

/**
 * Processes an array to generate a new array containing only the unique elements.
 * This helper function leverages JavaScript's Set object for efficient deduplication.
 * @param {Array<string>} sourceCollection - The array whose elements need to be deduplicated.
 * @returns {Array<string>} A new array comprising solely the unique elements from the input.
 */
function RemoveDuplicatesFromCollection(sourceCollection) {
    // Utilize a Set, which inherently stores only unique values, to filter out duplicates.
    const uniqueElementsSet = new Set(sourceCollection);
    // Convert the Set back into an array to return the result in the expected format.
    const deduplicatedArray = Array.from(uniqueElementsSet);
    return deduplicatedArray;
}