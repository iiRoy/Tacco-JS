process.stdin.resume();
process.stdin.setEncoding('utf8');

// This array will accumulate all lines read from standard input.
let receivedDataRows = [];

// Establish a readline interface to process input line by line.
// This abstraction handles buffering and line-ending detection.
const lineProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout // While not used for direct output, it's a common readline setup.
});

/**
 * A robust utility function to parse a string into an integer.
 * It includes basic error handling for non-numeric inputs.
 * @param {string} inputString - The string value intended to be a number.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const convertToStrictInteger = (inputString) => {
    const numericValue = parseInt(inputString, 10); // Use radix 10 for decimal numbers.
    if (isNaN(numericValue)) {
        // Log a warning for malformed input, but continue processing with a default.
        console.warn(`Input parsing warning: "${inputString}" is not a valid number. Defaulting to 0.`);
        return 0; // Provide a default value to prevent further errors.
    }
    return numericValue;
};

// Register an event handler for each incoming line of data.
lineProcessor.on('line', (currentLineContent) => {
    // Trim whitespace from the line and store it.
    receivedDataRows.push(currentLineContent.trim());
});

// Register an event handler for when the input stream concludes.
// This is where the main processing logic for the collected data resides.
lineProcessor.on('close', () => {

    // --- Initial Input Validation ---
    // Ensure we have enough data to perform the required operations.
    // The problem expects at least two lines of input.
    if (receivedDataRows.length < 2) {
        console.error("Execution Aborted: Insufficient input provided. Expected at least two lines of data.");
        // Output an empty string or a default result as a fallback.
        console.log("");
        return; // Exit the processing logic.
    }

    // The first line often contains metadata like the count of elements.
    // While not directly used in the sorting logic here, it's good practice to parse it.
    const declaredElementCount = convertToStrictInteger(receivedDataRows[0]);

    // The second line contains the space-separated numeric values to be sorted.
    const valuesStringForSorting = receivedDataRows[1];

    // --- Data Transformation Phase ---
    // Break down the string of values into an array of individual string representations.
    const individualValueStrings = valuesStringForSorting.split(" ");

    // Transform each string value into an object containing its parsed numeric value
    // and its original 1-based index (identifier) in the input sequence.
    const structuredDataPoints = individualValueStrings.map((itemValueStr, originalSequenceIndex) => {
        const parsedNumericRepresentation = convertToStrictInteger(itemValueStr);
        // The original problem uses 1-based indexing for the 'id'.
        const primaryIdentifier = originalSequenceIndex + 1;
        return {
            sortingKey: parsedNumericRepresentation,
            originalIndexTag: primaryIdentifier
        };
    });

    // --- Sorting Operation ---
    // Apply a custom sort function to arrange the structured data points.
    // The sorting is based on the 'sortingKey' in ascending order.
    const sortedStructuredData = structuredDataPoints.sort((itemA, itemB) => {
        // Standard comparison for ascending numerical sort.
        if (itemA.sortingKey < itemB.sortingKey) {
            return -1;
        }
        if (itemA.sortingKey > itemB.sortingKey) {
            return 1;
        }
        // If sorting keys are equal, maintain their original relative order (stable sort).
        return 0;
    });

    // --- Result Extraction and Formatting ---
    // After sorting, extract only the 'originalIndexTag' from each structured item.
    const finalOrderedIdentifiers = sortedStructuredData.map(dataPoint => dataPoint.originalIndexTag);

    // Join the extracted identifiers with a space to form the desired output string.
    const constructedOutputString = finalOrderedIdentifiers.join(" ");

    // --- Final Output ---
    // Display the result to standard output.
    console.log(constructedOutputString);
});