const systemOS = require('os');

// Main application logic encapsulated in a generator function
// This function processes input data and produces a final count based on specific character occurrences.
asyncOperation(async function * (emitOutput, retrieveInput) {
    // Define a mapping from target characters to their corresponding index in the tally array.
    const charToTallyIndex = { 'M': 0, 'A': 1, 'R': 2, 'C': 3, 'H': 4 };
    // Initialize an array to store the counts for 'M', 'A', 'R', 'C', 'H' in order.
    const characterTallyCounts = [0, 0, 0, 0, 0];

    // Fetch the total number of entries that need to be processed from the input stream.
    const totalInputEntries = parseInt(yield retrieveInput(), 10);

    // --- Input Validation ---
    // Ensure the fetched number of entries is a valid, non-negative integer.
    if (isNaN(totalInputEntries) || totalInputEntries < 0) {
        emitOutput("Error: The provided number of entries is invalid. Please supply a non-negative integer.");
        return; // Halt execution if input is erroneous.
    }

    // Iterate through each expected input entry to count character occurrences.
    for (let entryCounter = 0; entryCounter < totalInputEntries; ++entryCounter) {
        const currentInputEntry = yield retrieveInput();

        // --- Input String Validation ---
        // Skip processing if the input is not a string or is empty.
        if (typeof currentInputEntry !== 'string' || currentInputEntry.length === 0) {
            // Optionally, one could log a warning here. For this clone, we simply skip.
            continue;
        }

        // Extract the first character of the input entry.
        const initialCharacter = currentInputEntry.charAt(0);
        // Look up the index associated with this character in our mapping.
        const targetTallyIndex = charToTallyIndex[initialCharacter];

        // If the character is one of our designated targets, increment its count.
        if (targetTallyIndex !== undefined) {
            characterTallyCounts[targetTallyIndex]++;
        }
        // Entries not starting with 'M', 'A', 'R', 'C', 'H' are implicitly ignored.
    }

    // --- Combination Calculation ---
    // Calculate the total number of unique combinations of three distinct character types.
    let aggregateCombinations = 0;
    const numberOfCategories = characterTallyCounts.length; // The size of our tally array.

    // --- Combination Logic Validation ---
    // A minimum of three categories is required to form triplets.
    if (numberOfCategories < 3) {
        emitOutput("Warning: Insufficient character categories to form combinations of three.");
        return; // Exit early if combinations are not possible.
    }

    // Use three nested loops to iterate through all unique triplets of indices (i < j < k).
    for (let firstCategoryIdx = 0; firstCategoryIdx < numberOfCategories; ++firstCategoryIdx) {
        const countOfFirstCategory = characterTallyCounts[firstCategoryIdx]; // Cache value for efficiency.
        for (let secondCategoryIdx = firstCategoryIdx + 1; secondCategoryIdx < numberOfCategories; ++secondCategoryIdx) {
            const countOfSecondCategory = characterTallyCounts[secondCategoryIdx]; // Cache value.
            for (let thirdCategoryIdx = secondCategoryIdx + 1; thirdCategoryIdx < numberOfCategories; ++thirdCategoryIdx) {
                const countOfThirdCategory = characterTallyCounts[thirdCategoryIdx]; // Cache value.

                // Add the product of the counts for the current triplet to the total.
                aggregateCombinations += countOfFirstCategory * countOfSecondCategory * countOfThirdCategory;
            }
        }
    }

    // Output the final computed combination count to the standard output.
    emitOutput(aggregateCombinations);
});

/**
 * Orchestrates the execution of a generator-based application logic,
 * handling asynchronous standard input/output streams.
 *
 * @param {(outputFn: (data: string | number, terminator?: string) => void, inputFn: () => IterableIterator<string|null>) => IterableIterator<any>} appGeneratorFunction
 *   The core application logic, provided as a generator function. It receives
 *   an output function to write data and an input generator function to fetch tokens.
 */
function asyncOperation (appGeneratorFunction) {
    // References to standard input and output streams.
    const standardInput = process.stdin;
    const standardOutput = process.stdout;

    // Internal data structures for managing incoming input.
    let inputTokenQueue = [];           // Stores individual words/tokens ready for the app logic.
    let bufferedLinesQueue = [];        // Stores complete lines parsed from stream chunks.
    let partialStreamBuffer = "";       // Accumulates incomplete line data from stream chunks.
    let streamEndSignaled = false;      // Flag indicating if the input stream has finished sending data.

    // Enumeration for different input processing modes.
    const InputProcessingMode = {
        FETCH_FULL_LINE: 0, // Application is expecting a complete line.
        FETCH_WORD_TOKEN: 1  // Application is expecting an individual word/token.
    };
    let currentInputFetchMode = InputProcessingMode.FETCH_WORD_TOKEN;

    /**
     * Writes data to the standard output stream, appending a newline by default.
     * @param {string | number} dataToOutput - The data to be written. This will be converted to a string.
     * @param {string} [lineTerminator] - Optional string to append after the data. If omitted, uses the system's default EOL.
     */
    const emitOutput = (dataToOutput, lineTerminator) => {
        const outputString = String(dataToOutput) + (lineTerminator === undefined ? systemOS.EOL : lineTerminator);
        standardOutput.write(outputString);
    };

    /**
     * A generator function that serves input tokens or lines to the main application logic.
     * It dynamically switches its behavior based on the `currentInputFetchMode`.
     * @returns {IterableIterator<string|null>} An iterator yielding input tokens (words or lines).
     */
    function * retrieveInput () {
        // If there are already full lines buffered, provide the next one.
        if (bufferedLinesQueue.length > 0) {
            return bufferedLinesQueue.shift();
        } else {
            // If no lines are buffered, the application logic is now explicitly waiting for a full line.
            currentInputFetchMode = InputProcessingMode.FETCH_FULL_LINE;
            // Yield control back to the event loop, waiting for the next line to be produced.
            const receivedInputLine = yield;
            // After receiving the line, revert to word-by-word fetching as the default.
            currentInputFetchMode = InputProcessingMode.FETCH_WORD_TOKEN;
            return receivedInputLine;
        }
    }

    // Initialize the main application logic by passing it the I/O functions.
    const applicationLogicIterator = appGeneratorFunction(emitOutput, retrieveInput);

    /**
     * Callback function executed when a new chunk of data is received from `process.stdin`.
     * This function buffers the incoming data and parses it into complete lines.
     * @param {string | null} incomingDataChunk - The data chunk (string) or null if the stream has ended.
     */
    const processStreamChunk = (incomingDataChunk) => {
        // Pause the input stream to prevent further 'data' events while we process the current chunk.
        standardInput.pause();

        if (incomingDataChunk === null) {
            // A null chunk signifies the end of the input stream.
            bufferedLinesQueue.push(null);
        } else {
            partialStreamBuffer += incomingDataChunk; // Append the new chunk to our accumulated buffer.

            // Regular expression to find complete lines (ending with \n, \r\n, or \r).
            const lineExtractionRegex = /.*(\r?\n|\r)/g;
            let currentLineMatch;
            let lastMatchEndIndex = 0;

            // Extract all complete lines from the buffer.
            while ((currentLineMatch = lineExtractionRegex.exec(partialStreamBuffer)) !== null) {
                lastMatchEndIndex = lineExtractionRegex.lastIndex;
                bufferedLinesQueue.push(currentLineMatch[0]); // Add the complete line (including its terminator) to the queue.
            }
            // Retain any remaining partial data for the next chunk.
            partialStreamBuffer = partialStreamBuffer.substring(lastMatchEndIndex);
        }
        // After processing the chunk, attempt to feed input to the application logic.
        driveApplicationLogic();
    };

    /**
     * Drives the application logic by feeding it input from the internal buffers.
     * This function acts as the central control loop for generator progression.
     */
    function driveApplicationLogic () {
        // First, populate the input token queue from the buffered lines, based on the current mode.
        while (bufferedLinesQueue.length > 0) {
            switch (currentInputFetchMode) {
                case InputProcessingMode.FETCH_FULL_LINE: {
                    // If the app requested a full line, just shift it directly to the token queue.
                    inputTokenQueue.push(bufferedLinesQueue.shift());
                    break;
                }
                case InputProcessingMode.FETCH_WORD_TOKEN: {
                    // If the app requested a word, parse the current buffered line.
                    const currentBufferedLine = bufferedLinesQueue[0];
                    if (currentBufferedLine === null) {
                        // If end-of-stream marker is encountered, propagate it as a token.
                        inputTokenQueue.push(bufferedLinesQueue.shift());
                    } else {
                        // Regular expression to extract the first non-whitespace sequence (word).
                        const wordParserRegex = /[^\s]+/g;
                        let extractedWordMatch;

                        // Attempt to find and extract a word from the beginning of the line.
                        if ((extractedWordMatch = wordParserRegex.exec(currentBufferedLine)) !== null) {
                            inputTokenQueue.push(extractedWordMatch[0]); // Add the extracted word to the token queue.
                            // Update the buffered line by removing the extracted word.
                            bufferedLinesQueue[0] = currentBufferedLine.substring(wordParserRegex.lastIndex);
                        } else {
                            // If no words are found (e.g., line is empty or only whitespace), discard the line.
                            bufferedLinesQueue.shift();
                        }
                    }
                    break;
                }
            }

            // Once the input token queue has items, feed them to the application generator.
            while (inputTokenQueue.length > 0) {
                const nextAvailableToken = inputTokenQueue.shift();
                const generatorExecutionResult = applicationLogicIterator.next(nextAvailableToken);

                // If the generator produced a value, emit it to output.
                if (generatorExecutionResult.value !== undefined) {
                    emitOutput(generatorExecutionResult.value, ""); // Output the value without adding an extra newline.
                }

                // If the generator has indicated it's done, terminate the entire process.
                if (generatorExecutionResult.done) {
                    return;
                }
            }
        }

        // If all buffered input has been processed and the generator is still active,
        // either resume the stream or signal a final end-of-input if the stream has already completed.
        if (streamEndSignaled) {
            // If the stream has ended, but the generator might still be waiting for input,
            // send a final null chunk on the next event loop tick to ensure termination.
            // This prevents potential deadlocks if the generator is waiting indefinitely.
            setTimeout(processStreamChunk, 0, null);
        } else {
            standardInput.resume(); // Resume reading from the input stream to fetch more data.
        }
    }

    // Set up event listeners for standard input stream events.
    standardInput.on('data', processStreamChunk); // When data arrives, process it.
    standardInput.on('end', () => {
        streamEndSignaled = true; // Mark that the input stream has officially ended.
        processStreamChunk(null); // Process the final end-of-stream signal.
    });

    // Configure the input stream to decode data as UTF-8 strings.
    standardInput.setEncoding('utf8');

    // Initiate the process by simulating an initial null chunk.
    // This primes the `driveApplicationLogic` to start without waiting for external input.
    processStreamChunk(null);
}