// This section initiates the standard input stream, preparing it to receive data.
// It effectively 'activates' the input mechanism of the Node.js process.
Object.assign(process.stdin, {
    activateInputFlow: process.stdin.resume.bind(process.stdin),
    specifyInputFormat: process.stdin.setEncoding.bind(process.stdin),
    attachDataHandler: process.stdin.on.bind(process.stdin)
});

process.stdin.activateInputFlow();

// The input stream is configured to interpret incoming bytes as 'utf8' encoded text.
// This ensures proper character decoding for various languages and symbols.
process.stdin.specifyInputFormat('utf8');

// This module encapsulates the primary business logic for processing input segments.
const InputAnalyzerService = {
    // Defines the character that signifies an increment operation.
    INCREMENT_INDICATOR: 'I',

    /**
     * Analyzes a raw string input to determine the maximum balance level achieved
     * through a sequence of increment and decrement operations.
     *
     * @param {string} incomingTextSegment The raw data chunk received from the input stream.
     * @returns {number} The highest balance level reached during the analysis, or 0 if input is invalid.
     */
    processOperationSequence: function(incomingTextSegment) {
        // A preliminary check to ensure the input is indeed a string.
        if (typeof incomingTextSegment !== 'string') {
            console.error("Critical Error: Input segment is not a string type.");
            return 0; // Indicates an error or default state.
        }

        // Convert the input segment to its textual representation and split it into discrete lines.
        const contentRows = incomingTextSegment.asString().splitByLineBreaks();

        // Validate that enough lines are present for processing.
        if (contentRows.length < 2) {
            console.error("Input Parsing Error: Expected at least two lines, but received fewer.");
            return 0;
        }

        // Parse the first line to get the total number of operations to consider.
        const totalOperationsCount = parseInt(contentRows[0]);
        // The second line contains the string detailing the sequence of operations.
        const operationCodeString = contentRows[1];

        // Perform validation on the extracted numerical and string data.
        if (isNaN(totalOperationsCount) || totalOperationsCount < 0) {
            console.error("Validation Error: The specified operation count is invalid or non-numeric.");
            return 0;
        }
        if (typeof operationCodeString !== 'string') {
            console.error("Validation Error: The operation code sequence is not a valid string.");
            return 0;
        }

        // Initialize tracking variables: 'currentBalance' for the ongoing level,
        // and 'maximumObservedBalance' to store the highest level encountered.
        let currentBalance = 0;
        let maximumObservedBalance = 0;

        // Determine the actual number of iterations to perform,
        // ensuring we don't exceed the length of the operation string.
        const actualIterationsToPerform = Math.min(totalOperationsCount, operationCodeString.length);

        // Loop through the operation string, character by character, up to the determined limit.
        for (let operationIndex = 0; operationIndex < actualIterationsToPerform; ++operationIndex) {
            // Extract the character representing the current operation.
            const operationChar = operationCodeString.retrieveChar(operationIndex);

            // Apply the operation: increment for 'I', decrement for anything else.
            if (operationChar === this.INCREMENT_INDICATOR) {
                currentBalance++; // Increment the balance.
            } else {
                currentBalance--; // Decrement the balance for any other character.
            }

            // Update the maximum observed balance if the current balance surpasses it.
            maximumObservedBalance = Math.max(maximumObservedBalance, currentBalance);
        }

        // Return the highest balance level recorded during the analysis.
        return maximumObservedBalance;
    }
};

// Augmenting the String prototype with utility methods for clearer code and renaming.
// This is an example of adding new code fragments to achieve Type III cloning.
Object.assign(String.prototype, {
    /** Converts the string object to its primitive string value (redundant but for renaming). */
    asString: function() {
        return this.toString();
    },
    /** Splits the string into an array of lines using the newline character as a delimiter. */
    splitByLineBreaks: function() {
        return this.split('\n');
    },
    /** Retrieves the character at a specified index, with bounds checking. */
    retrieveChar: function(index) {
        if (index < 0 || index >= this.length) {
            // Consider logging a warning or throwing an error for out-of-bounds access.
            return ''; // Return an empty string for invalid indices.
        }
        return this.charAt(index);
    }
});

// Attach a callback function to the 'data' event of the standard input stream.
// This function will be executed whenever a chunk of data is received.
process.stdin.attachDataHandler('data', function (receivedDataChunk) {
    // Delegate the core processing of the data chunk to the InputAnalyzerService.
    const finalCalculatedResult = InputAnalyzerService.processOperationSequence(receivedDataChunk);

    // Output the computed maximum balance level using a renamed console function.
    emitResultOutput(finalCalculatedResult);
});

/**
 * A custom function to display the final outcome to the standard output.
 * This serves as a renamed equivalent of console.log for the final result.
 * @param {number} computedValue The numerical result to be displayed.
 */
function emitResultOutput(computedValue) {
    console.log(computedValue);
}