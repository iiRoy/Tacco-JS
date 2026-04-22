// This module is designed to handle incoming data streams, specifically to
// process lines containing space-separated numeric values by sorting them.

// Define a custom object to represent the standard input stream.
// This allows for a more abstract and potentially interchangeable input source.
const systemInputChannel = process.stdin;

// Establish a dedicated mechanism for displaying processed results.
// This encapsulates the output functionality, making it easier to modify or
// replace the output target later.
const outcomePresenter = {
    /**
     * Prints the final sorted sequence to the standard output.
     * @param {string} sortedSequence - The string containing the sorted numbers.
     */
    displayFinalSequence: (sortedSequence) => {
        console.log(sortedSequence);
    }
};

// Define the character used to separate individual numeric components within an input line.
const numberDelimiter = ' ';

/**
 * A specialized comparison function for sorting numeric values.
 * This function ensures that values are treated as numbers during comparison
 * and handles potential non-numeric inputs gracefully by pushing them to the end.
 * @param {string | number} firstOperand - The first value for comparison.
 * @param {string | number} secondOperand - The second value for comparison.
 * @returns {number} - A standard sort comparison result (-1, 0, or 1).
 */
function performNumericComparison(firstOperand, secondOperand) {
    const numValueA = Number(firstOperand);
    const numValueB = Number(secondOperand);

    // If both values are not numbers, consider them equal for sorting purposes
    // relative to each other, but their position relative to actual numbers
    // will be determined by subsequent checks.
    if (isNaN(numValueA) && isNaN(numValueB)) {
        return 0;
    }
    // If only the first value is not a number, it should come after the second.
    if (isNaN(numValueA)) {
        return 1;
    }
    // If only the second value is not a number, it should come after the first.
    if (isNaN(numValueB)) {
        return -1;
    }

    // For valid numeric values, perform a standard ascending order comparison.
    return numValueA - numValueB;
}

/**
 * Core function to process a single buffer of input data.
 * It converts the buffer to a string, splits it into components,
 * sorts these components numerically, and then re-joins them.
 * @param {Buffer} receivedDataBuffer - The raw buffer received from the input stream.
 * @returns {string} - A space-separated string of sorted numbers, or an empty string
 *                     if the input was invalid or contained no sortable numbers.
 */
function processInputLineForSorting(receivedDataBuffer) {
    // Transform the raw buffer into a UTF-8 encoded string.
    const fullTextLine = receivedDataBuffer.toString('utf8');

    // Preliminary check: if the line is empty or just whitespace after conversion,
    // there's nothing to process.
    if (fullTextLine.trim().length === 0) {
        // Optionally, one could log a debug message here:
        // console.debug("Skipping empty or whitespace-only input line.");
        return ''; // Return an empty string to indicate no meaningful output.
    }

    // Break the string into an array of individual components using the defined delimiter.
    const rawSegments = fullTextLine.split(numberDelimiter);

    // Filter out any empty strings that might result from multiple consecutive delimiters
    // or leading/trailing delimiters, as these are not valid numbers to sort.
    const meaningfulSegments = rawSegments.filter(segment => segment.trim() !== '');

    // If, after filtering, no segments remain, then there's nothing to sort.
    if (meaningfulSegments.length === 0) {
        // console.debug("No meaningful numeric segments found in the input line.");
        return '';
    }

    // Sort the filtered segments numerically using our custom comparison function.
    // This ensures correct ordering for both positive and negative numbers.
    const sortedNumericSegments = meaningfulSegments.sort(performNumericComparison);

    // Reassemble the sorted numeric segments back into a single string,
    // using the same delimiter for consistent formatting.
    const finalSortedSequence = sortedNumericSegments.join(numberDelimiter);

    return finalSortedSequence;
}

// Attach an event listener to the system input channel.
// This listener will invoke our processing logic whenever a 'data' event occurs,
// indicating that a new chunk of input is available.
systemInputChannel.on('data', (incomingDataChunk) => {
    // Execute the main processing routine for the received data.
    const sortedResultString = processInputLineForSorting(incomingDataChunk);

    // Only present the result if the processing yielded a non-empty string.
    if (sortedResultString !== '') {
        outcomePresenter.displayFinalSequence(sortedResultString);
    }
});

// Optionally, additional event listeners could be added here for 'end' or 'error'
// events on the input stream to handle stream lifecycle and potential issues.
/*
systemInputChannel.on('end', () => {
    // console.log("End of input stream reached. All data processed.");
});

systemInputChannel.on('error', (err) => {
    // console.error("An error occurred with the input stream:", err);
});
*/