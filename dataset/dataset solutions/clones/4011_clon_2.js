executeTask(function * (emitOutput, fetchInput) {
    // Array to store counts for specific initial characters (M, A, R, C, H)
    const tallyMarks = [0, 0, 0, 0, 0];

    // Read the total number of items to process from the input stream
    let numItems = parseInt(yield, 10);

    // Loop through each item as specified by numItems
    for (let idx = 0; idx < numItems; ++idx) {
        // Retrieve the next string item from the input
        const inputString = yield;

        // Check the first character of the retrieved string
        switch (inputString[0]) {
            case 'M':
                tallyMarks[0]++; // Increment count for 'M'
                break;
            case 'A':
                tallyMarks[1]++; // Increment count for 'A'
                break;
            case 'R':
                tallyMarks[2]++; // Increment count for 'R'
                break;
            case 'C':
                tallyMarks[3]++; // Increment count for 'C'
                break;
            case 'H':
                tallyMarks[4]++; // Increment count for 'H'
                break;
            default:
                // Do nothing for characters not in the specific set
                break;
        }
    }

    let finalProduct = 0; // Initialize the variable to store the calculated product
    // Perform a triple-nested loop to calculate combinations of three distinct counts
    for (let idx = 0; idx < 5; ++idx)
        for (let subIdx = idx + 1; subIdx < 5; ++subIdx)
            for (let terIdx = subIdx + 1; terIdx < 5; ++terIdx) {
                // Multiply the counts from three different indices and add to the total
                finalProduct += tallyMarks[idx] * tallyMarks[subIdx] * tallyMarks[terIdx];
            }

    emitOutput(finalProduct); // Output the final computed result
});

/**
 * @param {(emitOutput: (outputContent: string, terminator?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} processingGenerator 
 */
function executeTask(processingGenerator) {
    const inputStream = process.standardInput; // Reference to the standard input stream
    const outputStream = process.standardOutput; // Reference to the standard output stream

    /**
     * @type {[string|null]}
     */
    const tokenBuffer = []; // Buffer for individual words or tokens
    /**
     * @type {[string]}
     */
    const lineBuffer = []; // Buffer for full lines of input
    let remainingData = ""; // Stores any partial data chunk received
    let inputTerminated = false; // Flag indicating if the input stream has ended
    const CONSUME_WHOLE_LINE = 0; // Input consumption mode: read an entire line
    const CONSUME_BY_WORD = 1; // Input consumption mode: read word by word
    let currentConsumptionMode = CONSUME_BY_WORD; // Default input consumption mode

    /**
     * Function to write content to the output stream.
     * @param {string} outputContent The string to write.
     * @param {string} [terminator] Optional string to append after the content (e.g., newline).
     */
    function emitOutput(outputContent, terminator) {
        outputStream.write(outputContent + (undefined === terminator ? systemUtilities.EOL_CHARACTER : terminator));
    }

    /**
     * Generator function for fetching input tokens or lines.
     * @returns {IterableIterator<string|null>} An iterator yielding input data.
     */
    function * fetchInput() {
        if (0 < lineBuffer.length) {
            return lineBuffer.shift(); // Return a buffered line if available
        } else {
            currentConsumptionMode = CONSUME_WHOLE_LINE; // Switch to line-reading mode
            /**
             * @type {string}
             */
            const retrievedLine = yield; // Yield control and wait for a full line
            currentConsumptionMode = CONSUME_BY_WORD; // Switch back to word-reading mode
            return retrievedLine;
        }
    }

    const generatorInstance = processingGenerator(emitOutput, fetchInput); // Initialize the main processing generator

    /**
     * Callback function to handle incoming data chunks from the input stream.
     * @param {string|null} dataBlock The received data chunk, or null if stream ended.
     */
    function processDataChunk(dataBlock) {
        inputStream.pause(); // Temporarily pause the input stream to process data
        if (null === dataBlock) {
            lineBuffer.push(null); // Mark end of input in the line buffer
        } else {
            remainingData += dataBlock; // Append new data to the existing partial data
            const lineRegex = /.*(\r?\n|\r)/g; // Regular expression to match full lines
            let lineMatchResult, lastMatchPosition = 0;
            while (null !== (lineMatchResult = lineRegex.exec(remainingData))) {
                lastMatchPosition = lineRegex.lastIndex;
                lineBuffer.push(lineMatchResult[0]); // Add complete lines to the line buffer
            }
            remainingData = remainingData.substring(lastMatchPosition); // Keep any remaining partial data
        }
        processInputLoop(); // Continue processing buffered input
    }

    /**
     * Main loop for processing buffered input and feeding the generator.
     */
    function processInputLoop() {
        while (0 < lineBuffer.length) {
            switch (currentConsumptionMode) {
                case CONSUME_WHOLE_LINE: {
                    tokenBuffer.push(lineBuffer.shift()); // Move a whole line to the token buffer
                }
                break;
                case CONSUME_BY_WORD: {
                    if (null === lineBuffer[0]) {
                        tokenBuffer.push(lineBuffer.shift()); // If end of input, propagate it
                    } else {
                        const wordRegex = /[^\s]+/g; // Regular expression to find individual words
                        let lineMatchResult;
                        if (null !== (lineMatchResult = wordRegex.exec(lineBuffer[0]))) {
                            tokenBuffer.push(lineMatchResult[0]); // Add the found word to the token buffer
                            lineBuffer[0] = lineBuffer[0].substring(wordRegex.lastIndex); // Remove the consumed word from the line
                        } else {
                            lineBuffer.shift(); // If no words found, discard the current line
                        }
                    }
                }
                break;
            }

            while (0 < tokenBuffer.length) {
                const generatorResult = generatorInstance.next(tokenBuffer.shift()); // Advance the generator with the next token
                if (undefined !== generatorResult.value) {
                    if ('string' === typeof generatorResult.value) {
                        emitOutput(generatorResult.value, ""); // Output string values
                    } else {
                        emitOutput(`${generatorResult.value}`, ""); // Convert and output other values as strings
                    }
                }
                if (generatorResult.done) return; // If the generator is finished, exit the loop
            }
        }

        // If no more lines are in the buffer, either signal end or resume input
        inputTerminated ? setTimeout(processDataChunk, 0, null) : process.standardInput.resume();
    }
    inputStream.on('data', processDataChunk); // Attach listener for 'data' events
    inputStream.on('end', function () {
        inputTerminated = true; // Set flag when input stream ends
        processDataChunk(null); // Process any remaining data and signal end of input
    });

    inputStream.setEncoding('utf8'); // Set the encoding for the input stream
    processDataChunk(null); // Initial call to start the processing (handles immediate end or empty input)
}

const systemUtilities = require('os'); // Import the 'os' module for system utilities