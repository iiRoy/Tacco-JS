const systemUtilities = require('os');

/**
 * Orchestrates the execution of a generator-based program logic,
 * managing asynchronous input/output operations. It provides
 * a custom `printOutput` function for writing to standard output
 * and an `acquireData` generator for reading from standard input.
 *
 * @param {function(function(string, string?): void, function(): IterableIterator<string|null>): IterableIterator<any>} programLogic - The main generator function that contains the core application logic.
 */
function applicationEntry(programLogic) {
    // A quick check to ensure the environment is Node.js, as `process` is critical.
    if (typeof process === 'undefined' || !process.stdin || !process.stdout) {
        console.error("Fatal Error: This program requires a Node.js environment with standard I/O streams.");
        return; // Terminate if environment is not suitable.
    }

    const inputSource = process.stdin;  // Standard input stream.
    const outputSink = process.stdout;  // Standard output stream.

    // Define symbolic constants for input processing states.
    const INPUT_READ_MODE_LINE = Symbol('READ_FULL_LINE');
    const INPUT_READ_MODE_TOKEN = Symbol('READ_WORD_TOKEN');

    let parsedTokensQueue = [];           // Buffer for individual words/tokens extracted from lines.
    let bufferedRawLines = [];            // Buffer for complete lines read from the input stream.
    let incompleteChunkAccumulator = '';  // Holds partial data chunks received from the stream.
    let inputStreamExhausted = false;     // Flag indicating that the input stream has signaled its end.
    let currentInputReadMode = INPUT_READ_MODE_TOKEN; // Default mode: read input as individual tokens.

    /**
     * Outputs a given string to the configured output stream,
     * appending a system-specific newline character by default,
     * or a custom terminator if provided.
     *
     * @param {string} contentToWrite - The string data to be printed.
     * @param {string} [customTerminator] - An optional string to use as a line terminator instead of the default.
     */
    const printOutput = (contentToWrite, customTerminator) => {
        const finalTerminator = (customTerminator !== undefined) ? customTerminator : systemUtilities.EOL;
        outputSink.write(contentToWrite + finalTerminator);
    };

    /**
     * A generator function that serves as the input acquisition interface for `programLogic`.
     * It attempts to retrieve data from internal buffers. If a full line is requested
     * and not immediately available, it yields control, waiting for `kickOffProcessingCycle`
     * to provide the next line.
     *
     * @returns {IterableIterator<string|null>} An iterator yielding strings (for data) or `null` (for EOF).
     */
    function* acquireData() {
        if (bufferedRawLines.length > 0) {
            // If there are complete lines buffered, return the oldest one.
            return bufferedRawLines.shift();
        } else {
            // If no lines are buffered, signal that a full line is now expected.
            currentInputReadMode = INPUT_READ_MODE_LINE;
            /**
             * @type {string|null}
             */
            const receivedYieldValue = yield; // Pause until `next()` is called with a value.
            // After receiving the line, revert to token-reading mode.
            currentInputReadMode = INPUT_READ_MODE_TOKEN;
            return receivedYieldValue;
        }
    }

    // Initialize the main program logic, passing it the I/O handlers.
    const programIteratorInstance = programLogic(printOutput, acquireData);

    /**
     * Handles incoming data chunks from the standard input stream.
     * It pauses the stream, accumulates data, extracts complete lines,
     * and then triggers the main processing cycle.
     *
     * @param {string|Buffer|null} receivedChunk - The data received from the stream (string, Buffer, or null for EOF).
     */
    const handleInputStreamChunk = (receivedChunk) => {
        inputSource.pause(); // Temporarily halt stream flow while processing.

        if (receivedChunk === null) {
            // End-of-file signal received from the stream.
            bufferedRawLines.push(null);
        } else {
            // Append the new chunk to the accumulator, ensuring it's a string.
            incompleteChunkAccumulator += (typeof receivedChunk === 'string') ? receivedChunk : receivedChunk.toString('utf8');

            // Regular expression to identify complete lines (ending with any common newline sequence).
            const lineDelimiterRegex = /.*(\r?\n|\r)/g;
            let currentRegexMatch;
            let lastMatchEndPosition = 0;

            // Extract all complete lines from the accumulated buffer.
            while ((currentRegexMatch = lineDelimiterRegex.exec(incompleteChunkAccumulator)) !== null) {
                lastMatchEndPosition = lineDelimiterRegex.lastIndex;
                bufferedRawLines.push(currentRegexMatch[0]);
            }
            // Retain any remaining partial data for the next chunk.
            incompleteChunkAccumulator = incompleteChunkAccumulator.substring(lastMatchEndPosition);
        }
        // Immediately proceed to process the newly buffered data.
        kickOffProcessingCycle();
    };

    /**
     * The central processing loop that orchestrates feeding input to the `programIteratorInstance`
     * and handling its output. It continues as long as there is buffered input or the iterator
     * is active.
     */
    const kickOffProcessingCycle = () => {
        // Continue processing buffered lines as long as they are available.
        while (bufferedRawLines.length > 0) {
            switch (currentInputReadMode) {
                case INPUT_READ_MODE_LINE: {
                    // If the logic requires a full line, take it from the buffer.
                    parsedTokensQueue.push(bufferedRawLines.shift());
                    break;
                }
                case INPUT_READ_MODE_TOKEN: {
                    // If the logic requires individual tokens.
                    if (bufferedRawLines[0] === null) {
                        // If the first buffered item is an EOF marker, pass it as a token.
                        parsedTokensQueue.push(bufferedRawLines.shift());
                    } else {
                        // Regex to extract the next non-whitespace token.
                        const tokenSeparatorRegex = /\S+/g;
                        let tokenMatch;
                        // Attempt to find a token on the current line.
                        if ((tokenMatch = tokenSeparatorRegex.exec(bufferedRawLines[0])) !== null) {
                            parsedTokensQueue.push(tokenMatch[0]);
                            // Remove the extracted token from the line.
                            bufferedRawLines[0] = bufferedRawLines[0].substring(tokenSeparatorRegex.lastIndex);
                        } else {
                            // If no tokens remain on this line, discard it.
                            bufferedRawLines.shift();
                        }
                    }
                    break;
                }
                default:
                    // Log a warning for any unhandled input modes.
                    console.warn("An unrecognized input processing mode was encountered.");
                    break;
            }

            // Feed any available parsed tokens to the program logic iterator.
            while (parsedTokensQueue.length > 0) {
                const iteratorStepResult = programIteratorInstance.next(parsedTokensQueue.shift());

                // If the iterator yielded a value, output it.
                if (iteratorStepResult.value !== undefined) {
                    // Ensure the output is always treated as a string.
                    printOutput(String(iteratorStepResult.value), "");
                }
                // If the program logic has completed, terminate the execution.
                if (iteratorStepResult.done) {
                    return; // Program execution finished.
                }
            }
        }

        // If all buffered lines are processed and the stream has ended,
        // schedule a final EOF processing cycle. Otherwise, resume input.
        if (inputStreamExhausted) {
            setImmediate(() => handleInputStreamChunk(null)); // Use setImmediate to yield control.
        } else {
            inputSource.resume(); // Re-enable the input stream to receive more data.
        }
    };

    // Attach event listeners to the standard input stream.
    inputSource.on('data', handleInputStreamChunk);
    inputSource.on('end', () => {
        inputStreamExhausted = true;
        handleInputStreamChunk(null); // Process any remaining partial data, then signal EOF.
    });

    // Configure the input stream to interpret data as UTF-8 characters.
    inputSource.setEncoding('utf8');

    // Initiate the process by simulating an initial empty chunk.
    // This allows the `programLogic` to start executing and potentially
    // yield for input immediately, or run without initial input.
    handleInputStreamChunk(null);
}


// --- Main Application Logic ---
// This section contains the specific problem-solving code.
applicationEntry(function* (printOutput, acquireData) {
    // Retrieve initial numeric inputs. These numbers dictate patterns to be generated.
    const initialFirstCount = parseInt(yield acquireData(), 10);
    const initialSecondCount = parseInt(yield acquireData(), 10);

    // Create working copies of counts, decrementing by one as per original problem logic.
    // The original code uses `+(yield) - 1` for `white` and `black`.
    let workingFirstCount = initialFirstCount - 1;
    let workingSecondCount = initialSecondCount - 1;

    // Calculate the total number of rows required for both patterns.
    // The original formula `Math.floor((N - 1) / 50) * 2 + 2` is applied to the initial counts.
    const rowsForFirstPattern = Math.floor((initialFirstCount - 1) / 50) * 2 + 2;
    const rowsForSecondPattern = Math.floor((initialSecondCount - 1) / 50) * 2 + 2;
    const totalOutputRows = rowsForFirstPattern + rowsForSecondPattern;

    // Output the calculated total rows and a fixed column width.
    printOutput(`${totalOutputRows} 100`);

    // --- Pattern Generation Loop for the First Quantity ---
    // This loop generates a series of two-line patterns based on `workingFirstCount`.
    // Each iteration processes 100 characters (50 segments of 2).
    // Pattern when `workingFirstCount > 0`: First line: ".#", Second line: "##"
    // Pattern when `workingFirstCount <= 0`: First line: "##", Second line: "##"
    while (true) {
        const firstPatternRowSegments = [];
        const secondPatternRowSegments = [];
        const lineCharacterWidth = 100;
        const segmentIncrement = 2; // Each segment is 2 characters.

        for (let segmentPosition = 0; segmentPosition < lineCharacterWidth; segmentPosition += segmentIncrement) {
            if (workingFirstCount > 0) {
                firstPatternRowSegments.push(".#");
                secondPatternRowSegments.push("##");
                workingFirstCount--; // Decrement the count for each unit of pattern generated.
            } else {
                // If count is exhausted, fill the rest of the line with the default 'empty' pattern.
                firstPatternRowSegments.push("##");
                secondPatternRowSegments.push("##");
            }
        }
        printOutput(firstPatternRowSegments.join(''));
        printOutput(secondPatternRowSegments.join(''));

        // The loop continues as long as `workingFirstCount` was positive at the start of the iteration.
        // It breaks when `workingFirstCount` drops below zero, indicating all necessary patterns are printed.
        if (workingFirstCount < 0) {
            break;
        }
    }

    // --- Pattern Generation Loop for the Second Quantity ---
    // Similar to the first loop, but uses `workingSecondCount` and a different pattern.
    // Pattern when `workingSecondCount > 0`: First line: "..", Second line: "#."
    // Pattern when `workingSecondCount <= 0`: First line: "..", Second line: ".."
    while (true) {
        const firstPatternRowSegments = [];
        const secondPatternRowSegments = [];
        const lineCharacterWidth = 100;
        const segmentIncrement = 2;

        for (let segmentPosition = 0; segmentPosition < lineCharacterWidth; segmentPosition += segmentIncrement) {
            if (workingSecondCount > 0) {
                firstPatternRowSegments.push("..");
                secondPatternRowSegments.push("#.");
                workingSecondCount--; // Decrement count.
            } else {
                // If count is exhausted, fill with the default 'empty' pattern.
                firstPatternRowSegments.push("..");
                secondPatternRowSegments.push("..");
            }
        }
        printOutput(firstPatternRowSegments.join(''));
        printOutput(secondPatternRowSegments.join(''));

        // Loop termination condition.
        if (workingSecondCount < 0) {
            break;
        }
    }
});