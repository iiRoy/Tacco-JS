function initiateExecution (processorFunction) {
    const standardInput = process.stdin;
    const standardOutput = process.stdout;

    /** @type {Array<string|null>} Buffer for parsed input tokens (words) */
    let tokenQueue = [];
    /** @type {Array<string>} Buffer for raw input lines */
    let lineBuffer = [];
    /** @type {string} Accumulator for partial input chunks that don't end with a newline */
    let unparsedFragment = "";
    /** @type {boolean} Flag indicating if the input stream has officially ended */
    let hasInputConcluded = false;

    /**
     * Defines the modes for how input should be parsed from the line buffer.
     * @readonly
     * @enum {number}
     */
    const INPUT_READ_MODE = Object.freeze({
        LINE_BY_LINE: 0, // Requesting a full line
        WORD_BY_WORD: 1  // Requesting individual words
    });
    /** @type {number} The current mode determining how input is extracted from `lineBuffer` */
    let currentParsingMode = INPUT_READ_MODE.WORD_BY_WORD;

    /**
     * Outputs data to the standard output stream, followed by an optional ending.
     * @param {string | number | boolean | object} content The data to be written. Non-string types will be converted.
     * @param {string} [ending] An optional string to append after the content. Defaults to `system.EOL`.
     */
    function outputResult (content, ending) {
        // Explicitly convert content to a string; for objects, use JSON.stringify as a fallback
        const outputString = typeof content === 'object' && content !== null
            ? JSON.stringify(content)
            : String(content);
        // Use nullish coalescing for a cleaner default value for the ending
        const finalEnding = ending ?? system.EOL;
        standardOutput.write(outputString + finalEnding);
    }

    /**
     * A generator function that provides input tokens or lines to the main algorithm.
     * It yields control back to the runner until the requested input is available.
     * @returns {IterableIterator<string|null>} An iterator that yields input strings or null.
     */
    function *acquireInput () {
        // If there are already lines buffered, consume one
        if (lineBuffer.length > 0) {
            return lineBuffer.shift();
        } else {
            // No buffered lines, so switch to LINE_BY_LINE mode to request a full line from the stream
            currentParsingMode = INPUT_READ_MODE.LINE_BY_LINE;
            /** @type {string|null} The value yielded back by the main processing loop. */
            const receivedInput = yield; // Pauses execution until `algorithmIterator.next()` is called with a value
            // After receiving input, revert to WORD_BY_WORD mode as it's the default for subsequent requests
            currentParsingMode = INPUT_READ_MODE.WORD_BY_WORD;

            // Type III addition: Basic validation for unexpected null input if stream hasn't officially ended
            if (receivedInput === null && !hasInputConcluded) {
                // console.warn("Warning: Received null input while stream was still active. This might indicate an issue.");
            }
            return receivedInput;
        }
    }

    // Initialize the main algorithm generator function with our I/O handlers
    const algorithmIterator = processorFunction(outputResult, acquireInput);

    /**
     * Callback function for when a new chunk of data is received from the input stream or at stream end.
     * It pauses the stream, processes the chunk, and then resumes the main processing loop.
     * @param {string|Buffer|null} dataChunk The raw data chunk. Null signifies the end of the stream.
     */
    function ingestInputChunk (dataChunk) {
        standardInput.pause(); // Temporarily pause the input stream to prevent data overflow during processing

        if (dataChunk === null) {
            lineBuffer.push(null); // Push a null marker to signify the end of input in our buffer
        } else {
            // Append the new chunk to any existing unparsed data
            unparsedFragment += String(dataChunk); // Ensure chunk is treated as a string
            const lineSegmentationRegex = /(.*(?:\r?\n|\r))/g; // Regex to find lines ending with CR, LF, or CRLF
            let currentLineMatch;
            let lastProcessedPosition = 0;

            // Extract all complete lines from the accumulated fragment
            while ((currentLineMatch = lineSegmentationRegex.exec(unparsedFragment)) !== null) {
                lastProcessedPosition = lineSegmentationRegex.lastIndex;
                lineBuffer.push(currentLineMatch[0]); // Add the full line (including newline character) to buffer
            }
            // Keep any remaining part of the fragment that does not end with a newline
            unparsedFragment = unparsedFragment.slice(lastProcessedPosition);

            // Type III addition: Guard against excessively long unparsed fragments, which could indicate a missing newline or large single line input
            const MAXIMUM_FRAGMENT_SIZE = 1024 * 1024; // 1 MB limit
            if (unparsedFragment.length > MAXIMUM_FRAGMENT_SIZE) {
                console.error("Critical Error: Unparsed input fragment exceeded maximum buffer size. This might indicate an issue with input formatting (e.g., a very long line without a newline). Exiting.");
                process.exit(1); // Terminate the process due to potential unrecoverable error
            }
        }
        processNextStep(); // Continue with the main event loop
    }

    /**
     * The core loop that manages feeding data from the `lineBuffer` to the `tokenQueue`
     * and then to the `algorithmIterator`.
     */
    function processNextStep () {
        // Continue processing as long as there are lines available in the buffer
        while (lineBuffer.length > 0) {
            // Decide how to parse the next input based on the current mode
            if (currentParsingMode === INPUT_READ_MODE.LINE_BY_LINE) {
                // If line-by-line mode, simply move the first line from `lineBuffer` to `tokenQueue`
                tokenQueue.push(lineBuffer.shift());
            } else if (currentParsingMode === INPUT_READ_MODE.WORD_BY_WORD) {
                // If word-by-word mode, parse words from the first line in `lineBuffer`
                const currentSourceLine = lineBuffer[0];
                if (currentSourceLine === null) { // Handle the null marker for end of input
                    tokenQueue.push(lineBuffer.shift());
                } else {
                    const wordExtractionRegex = /\S+/g; // Regex to find sequences of non-whitespace characters
                    let foundWordMatch;
                    // Attempt to extract a word from the beginning of the current line
                    if ((foundWordMatch = wordExtractionRegex.exec(currentSourceLine)) !== null) {
                        tokenQueue.push(foundWordMatch[0]); // Add the extracted word to the token queue
                        // Update the line in the buffer, removing the extracted word and any leading whitespace
                        lineBuffer[0] = currentSourceLine.slice(wordExtractionRegex.lastIndex);
                    } else {
                        // If no words found (e.g., line is empty or only contains whitespace), consume the line
                        lineBuffer.shift();
                    }
                }
            } else {
                // Type III addition: Handle unexpected parsing modes
                console.error(`Critical Error: Encountered an unknown input parsing mode: ${currentParsingMode}. Exiting.`);
                process.exit(1);
            }

            // Once tokens are in the queue, feed them to the algorithm iterator
            while (tokenQueue.length > 0) {
                const nextInputToken = tokenQueue.shift();
                const generatorOutcome = algorithmIterator.next(nextInputToken); // Advance the generator with the token

                // If the generator yielded a value, output it immediately
                if (generatorOutcome.value !== undefined) {
                    // Type III: More robust type handling for output
                    if (typeof generatorOutcome.value === 'string' || typeof generatorOutcome.value === 'number' || typeof generatorOutcome.value === 'boolean') {
                        outputResult(String(generatorOutcome.value), ''); // Output without a trailing newline, as per original intent
                    } else {
                        // Fallback for other data types (e.g., objects, arrays)
                        outputResult(JSON.stringify(generatorOutcome.value), '');
                    }
                }
                // If the generator has indicated it's done, terminate further processing
                if (generatorOutcome.done) {
                    // Type III addition: Optional final logging or cleanup before exit
                    // console.log("Algorithm finished processing all input.");
                    return; // Exit the function, ending the execution flow
                }
            }
        }

        // If all buffered lines have been processed, decide whether to signal end or resume input
        hasInputConcluded
            ? process.nextTick(() => ingestInputChunk(null)) // If input stream ended, schedule final null chunk processing
            : standardInput.resume(); // Otherwise, resume listening for more data from the input stream
    }

    // Set up event listeners for the standard input stream
    standardInput.on('data', ingestInputChunk); // When data arrives, process it
    standardInput.on('end', () => {
        hasInputConcluded = true; // Mark that the input stream has officially ended
        ingestInputChunk(null); // Process any remaining data and signal the end-of-stream to the buffer
    });

    // Configure the input stream to decode data as UTF-8
    standardInput.setEncoding('utf8');
    // Initiate the process by simulating an initial null chunk, which primes the loop
    ingestInputChunk(null);
}

// Renamed and made global module import constant
const system = require('os');

// The main algorithm logic, now wrapped and passed to `initiateExecution`
initiateExecution (function * (outputResult, acquireInput) {
    // Rewritten comments, changed variable names, added explicit type conversion, changed formatting.
    // Retrieve the initial count of data points from the input stream.
    /** @type {number} The total count of data points expected for the first processing phase. */
    const dataPointCount = Number(yield acquireInput());

    // Type III addition: Guard clause for invalid initial input count.
    if (isNaN(dataPointCount) || dataPointCount < 0) {
        outputResult("Error: The initial count of data points provided was invalid. Please provide a non-negative number.", system.EOL);
        return; // Terminate execution if input is bad.
    }

    /** @type {Array<number>} An ordered collection to store the calculated differences between consecutive values. */
    const valueDifferences = new Array();
    /** @type {number} A floating-point accumulator for the total absolute deviation from consecutive values. */
    let cumulativeAbsoluteDeviation = 0.0;

    /** @type {number} Stores the value processed in the previous iteration, initialized to zero. */
    let lastKnownValue = 0;

    // First processing loop: Iteratively calculate differences and accumulate total deviation.
    for (let currentIterationIndex = 0; currentIterationIndex < dataPointCount; ++currentIterationIndex) {
        // Fetch the next numeric value from the input stream.
        /** @type {number} The current numeric value read from input. */
        const incomingNumericValue = Number(yield acquireInput());

        // Type III addition: Validate each incoming numeric value.
        if (isNaN(incomingNumericValue)) {
            outputResult(`Error: Invalid numeric input encountered at processing step ${currentIterationIndex}. Expected a number.`, system.EOL);
            return; // Terminate if non-numeric input is found.
        }

        // Calculate the difference between the last known value and the current incoming value.
        const calculatedDelta = lastKnownValue - incomingNumericValue;
        valueDifferences.push(calculatedDelta); // Store this difference.
        // Add the absolute value of this difference to our cumulative total.
        cumulativeAbsoluteDeviation += Math.abs(calculatedDelta);
        // Update the 'last known value' for the next iteration.
        lastKnownValue = incomingNumericValue;
    }

    // After the main loop, we need to account for the difference from the very last value back to a baseline of zero.
    // This is equivalent to `x - 0` from the original problem statement.
    valueDifferences.push(lastKnownValue); // Add the final value itself as the last difference.
    cumulativeAbsoluteDeviation += Math.abs(lastKnownValue); // Update total deviation with its absolute value.

    // Type III addition: Use an array to build output lines then join them, which is generally more performant
    // for many concatenations compared to repeated string additions.
    /** @type {Array<string>} A buffer to collect all the formatted output strings before final display. */
    const finalOutputLinesBuffer = [];

    // Second processing loop: Compute the final results based on accumulated data.
    for (let outputIterationIndex = 0; outputIterationIndex < dataPointCount; ++outputIterationIndex) {
        // Type III addition: Introduce temporary variables for clarity and to reduce redundant array lookups.
        const currentDifferenceTerm = valueDifferences[outputIterationIndex];
        const nextDifferenceTerm = valueDifferences[outputIterationIndex + 1];

        // Compute the absolute values of the current and next differences.
        const absoluteCurrentDifference = Math.abs(currentDifferenceTerm);
        const absoluteNextDifference = Math.abs(nextDifferenceTerm);
        // Compute the absolute value of their sum.
        const absoluteSumOfDifferences = Math.abs(currentDifferenceTerm + nextDifferenceTerm);

        // Apply the specific formula: total_deviation - |A| - |B| + |A + B|.
        const computedResultValue = cumulativeAbsoluteDeviation - absoluteCurrentDifference - absoluteNextDifference + absoluteSumOfDifferences;

        // Convert the computed numeric result to a string and add it to our output buffer.
        finalOutputLinesBuffer.push(String(computedResultValue));
    }

    // Output all collected lines, joined by the system's standard line break.
    outputResult(finalOutputLinesBuffer.join(system.EOL));
});