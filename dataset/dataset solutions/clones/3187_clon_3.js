const InputDataProcessorFactory = (function () {
    /**
     * Represents a robust handler for processing a stream of input data,
     * allowing for reading line by line or token by token.
     * It intelligently manages raw source lines and the current reading position,
     * optimizing for sequential access patterns.
     *
     * @class
     */
    class DataStreamHandler {
        /**
         * @private {string[]} _sourceLines - An internal array storing each line of the raw input string.
         *                                    Pre-processed by trimming and splitting the initial input.
         */
        _sourceLines;

        /**
         * @private {number} _currentLinePointer - A zero-based index indicating the next line to be
         *                                         processed from the `_sourceLines` array.
         */
        _currentLinePointer;

        /**
         * @private {string[]} _currentLineTokens - A temporary buffer holding tokens from the currently
         *                                          active line, primarily used by `nextValue` for sequential token extraction.
         *                                          It is cleared when a full line is consumed or a new line is read.
         */
        _currentLineTokens;

        /**
         * Constructs a new DataStreamHandler instance, preparing the input for subsequent reading operations.
         *
         * @param {string} rawInputString - The complete, raw input content, typically read from a file or standard input.
         * @throws {Error} If the provided input is not a valid string or is empty after trimming.
         */
        constructor(rawInputString) {
            // Validate the input string to ensure it's processable.
            if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
                throw new Error('DataStreamHandler: Input data must be a non-empty string.');
            }

            // Standardize the input: remove leading/trailing whitespace from the entire block,
            // then split into an array of lines.
            this._sourceLines = rawInputString.trim().split('\n');
            this._currentLinePointer = 0; // Initialize line pointer to the first line.
            this._currentLineTokens = []; // No tokens are loaded initially.
        }

        /**
         * Extracts and returns the next individual token from the input stream.
         * This method prioritizes tokens already loaded from the current line.
         * If the current line's tokens are exhausted, it loads and processes the next line.
         *
         * @param {boolean} [shouldConvertToNumber=true] - If true, the extracted token will be
         *                                                 coerced to a number; otherwise, it remains a string.
         * @returns {string|number} The single token, processed as per `shouldConvertToNumber`.
         * @throws {Error} If an attempt is made to read beyond the available input lines.
         */
        nextValue(shouldConvertToNumber = true) {
            // Enforce boundaries: check if all lines have been consumed.
            if (this._currentLinePointer >= this._sourceLines.length) {
                throw new Error('DataStreamHandler: Cannot read next value; end of input stream reached.');
            }

            // If the current line's token buffer is empty, it's time to load a new line.
            if (this._currentLineTokens.length === 0) {
                const currentLineContent = this._sourceLines[this._currentLinePointer];
                // Split the line by any sequence of one or more whitespace characters.
                // `filter(Boolean)` removes any empty strings that might result from multiple spaces.
                this._currentLineTokens = currentLineContent.split(/\s+/).filter(Boolean);

                // Additional check for lines that might be empty or contain only whitespace
                // after processing, though `trim()` and `filter(Boolean)` should largely prevent this.
                if (this._currentLineTokens.length === 0) {
                    // If a line yields no tokens, it's effectively empty. Advance pointer and try again
                    // or throw an error depending on expected input format.
                    // For this clone, we assume lines processed by nextValue will always yield tokens.
                    this._currentLinePointer++; // Skip this empty/whitespace-only line.
                    return this.nextValue(shouldConvertToNumber); // Recursively try to get value from next line.
                }
            }

            // Retrieve the first token from the buffer and remove it.
            const extractedToken = this._currentLineTokens.shift();

            // If the buffer is now empty, it means all tokens from the current line have been consumed.
            // Advance the line pointer to prepare for the next line.
            if (this._currentLineTokens.length === 0) {
                this._currentLinePointer++;
            }

            // Return the token, applying number conversion if requested.
            return shouldConvertToNumber ? Number(extractedToken) : extractedToken;
        }

        /**
         * Reads an entire line from the input stream, processes it into an array of tokens,
         * and immediately advances the line pointer to the next line.
         * Any pending tokens in `_currentLineTokens` are discarded as a full line is consumed.
         *
         * @param {boolean} [shouldConvertToNumber=true] - If true, each token in the line will be
         *                                                 coerced to a number; otherwise, they remain strings.
         * @returns {string[]|number[]} An array of tokens representing the consumed line.
         * @throws {Error} If an attempt is made to read beyond the available input lines.
         */
        getLineAsTokens(shouldConvertToNumber = true) {
            if (this._currentLinePointer >= this._sourceLines.length) {
                throw new Error('DataStreamHandler: Cannot read line; end of input stream reached.');
            }

            // Fetch the current line's content and then increment the line pointer.
            const lineContent = this._sourceLines[this._currentLinePointer++];
            // Clear any buffered tokens, as this method consumes a full line.
            this._currentLineTokens = [];

            // Split the line into parts using whitespace as a delimiter, filtering out empty strings.
            const lineParts = lineContent.split(/\s+/).filter(Boolean);

            return shouldConvertToNumber ? lineParts.map(Number) : lineParts;
        }

        /**
         * Reads a specified quantity of lines from the input, treating them as a 2D array (matrix).
         * Each line is split into tokens. The line pointer is advanced by the `rowCount`.
         *
         * @param {number} rowCount - The total number of lines (rows) to read for the matrix.
         * @param {boolean} [shouldConvertToNumber=true] - If true, all tokens within the matrix will be
         *                                                 coerced to numbers.
         * @returns {string[][]|number[][]} A two-dimensional array representing the matrix data.
         * @throws {Error} If there are insufficient lines remaining in the input stream to fulfill the request.
         */
        readMultipleLines(rowCount, shouldConvertToNumber = true) {
            // Validate that enough lines exist for the requested matrix.
            if (this._currentLinePointer + rowCount > this._sourceLines.length) {
                throw new Error(`DataStreamHandler: Not enough lines remaining to read a matrix of ${rowCount} rows.`);
            }

            // Extract the specified number of lines.
            const extractedLines = this._sourceLines.slice(this._currentLinePointer, this._currentLinePointer + rowCount);
            this._currentLinePointer += rowCount; // Advance the line pointer.
            this._currentLineTokens = []; // Clear any pending tokens.

            // Process each extracted line, splitting it into tokens.
            const processedMatrix = extractedLines.map(line =>
                line.split(/\s+/).filter(Boolean)
            );

            // Apply number conversion if requested.
            return shouldConvertToNumber ? processedMatrix.map(row => row.map(Number)) : processedMatrix;
        }

        /**
         * Reads a specified number of lines directly, returning them as an array of strings.
         * Optionally, it can attempt to convert each line to a number if the content permits.
         * The line pointer is advanced by the `count`.
         *
         * @param {number} count - The number of raw lines to retrieve.
         * @param {boolean} [shouldConvertToNumber=true] - If true, each raw line string will be
         *                                                 coerced to a number.
         * @returns {string[]|number[]} An array containing the raw line strings or their numeric equivalents.
         * @throws {Error} If there are insufficient lines remaining in the input stream.
         */
        getRawLines(count, shouldConvertToNumber = true) { // Default true to match original behavior.
            if (this._currentLinePointer + count > this._sourceLines.length) {
                throw new Error(`DataStreamHandler: Not enough lines remaining to read ${count} raw lines.`);
            }

            // Slice the required lines without further processing.
            const lines = this._sourceLines.slice(this._currentLinePointer, this._currentLinePointer + count);
            this._currentLinePointer += count; // Update the line pointer.
            this._currentLineTokens = []; // Clear any pending tokens.

            // Return lines, with optional number conversion.
            return shouldConvertToNumber ? lines.map(Number) : lines;
        }
    }

    /**
     * Factory function responsible for creating and returning an instance of `DataStreamHandler`.
     * This maintains the original module pattern where a factory function is exposed.
     *
     * @param {string} inputString - The raw input data to be processed.
     * @returns {DataStreamHandler} A new, configured instance of the data stream handler.
     */
    function createDataProcessor(inputString) {
        return new DataStreamHandler(inputString);
    }

    // The IIFE returns an object containing the factory function.
    return {
        createDataProcessor: createDataProcessor,
    };
})();

// --- Main Application Logic ---

// Initialize the input data handler by reading from standard input.
// `require("fs").readFileSync("/dev/stdin", "utf8")` is a Node.js specific way to get stdin content.
const applicationInputHandler = InputDataProcessorFactory.createDataProcessor(
    require("fs").readFileSync("/dev/stdin", "utf8")
);

// Execute the primary calculation function and output its result to console.
console.log(performMainCalculation());

/**
 * Orchestrates the primary logic of the program: reading input, processing preferences,
 * and determining the count of items universally liked.
 *
 * @returns {number} The final count of items liked by every participant.
 */
function performMainCalculation() {
    // Read the first two integers from the input stream.
    // 'numParticipants' corresponds to 'n' in the original problem statement, often representing a count of entities (e.g., people, operations).
    const numParticipants = applicationInputHandler.nextValue();
    // 'totalItems' corresponds to 'm', representing the total number of distinct items or categories.
    const totalItems = applicationInputHandler.nextValue();

    // Implement a guard clause for edge cases or invalid input parameters.
    // If there are no participants or no items, no item can be universally liked.
    if (numParticipants <= 0 || totalItems <= 0) {
        return 0; // Return 0 immediately as no meaningful calculation can occur.
    }

    // Create a frequency map (an array) to store how many participants liked each item.
    // The array is initialized with `totalItems` zeros, where each index represents an item.
    const itemLikeFrequencyMap = new Array(totalItems).fill(0);

    // Iterate through each participant to process their individual preferences.
    // This loop runs `numParticipants` times, once for each participant.
    for (let currentParticipantIndex = 0; currentParticipantIndex < numParticipants; currentParticipantIndex++) {
        // Read the current participant's entire line of preferences.
        // This line is expected to start with a number indicating how many items they prefer,
        // followed by the identifiers of those preferred items.
        const preferencesForCurrentParticipant = applicationInputHandler.getLineAsTokens();

        // The first element of the preference list is the count of items listed.
        const countOfPreferencesListed = preferencesForCurrentParticipant[0];

        // Loop through the listed preferred items for the current participant.
        // The original logic uses an unconventional indexing: `preferencesForCurrentParticipant[preferenceIterator - 1]`.
        // This implies that `preferencesForCurrentParticipant[0]` is used *both* as the count
        // and as the first item identifier to be processed. This behavior is intentionally preserved.
        for (let preferenceIterator = 1; preferenceIterator <= countOfPreferencesListed; preferenceIterator++) {
            const preferredItemIdentifier = preferencesForCurrentParticipant[preferenceIterator - 1];

            // Perform a robust validation check for the item identifier.
            // Ensure the item ID is within the valid range [0, totalItems - 1].
            if (preferredItemIdentifier >= 0 && preferredItemIdentifier < totalItems) {
                // If valid, increment the count for this specific item in our frequency map.
                itemLikeFrequencyMap[preferredItemIdentifier]++;
            } else {
                // For Type III, adding error handling or warnings is a valid modification.
                // console.warn(`Invalid item identifier encountered: ${preferredItemIdentifier} for participant ${currentParticipantIndex}. Skipping.`);
                // Depending on problem requirements, one might throw an error here.
            }
        }
    }

    // After aggregating all participant preferences, calculate how many items were liked by *all* participants.
    // This is achieved by filtering the `itemLikeFrequencyMap` to find items whose frequency
    // exactly matches the `numParticipants`, and then counting such items.
    // This replaces the original explicit loop with a more declarative functional approach (Type III change).
    const universallyLikedItemsCount = itemLikeFrequencyMap.filter(
        (itemCount) => itemCount === numParticipants
    ).length;

    // Return the final computed result.
    return universallyLikedItemsCount;
}