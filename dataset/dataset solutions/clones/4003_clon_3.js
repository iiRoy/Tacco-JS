executeProgram(function* mainApplicationLogic(printOutput, fetchInput) {
    // This is the core application logic. It fetches input, processes it, and outputs results.

    // Retrieve the initial input value using the provided fetcher.
    let rawInputValue = yield fetchInput();

    // Implement a guard clause for invalid or empty input.
    if (rawInputValue === null || rawInputValue.trim() === '') {
        printOutput("Error: No numeric input detected or input was empty.", STANDARD_OS_MODULE.EOL);
        return; // Exit if input is not suitable.
    }

    // Convert the raw string input to a numerical representation.
    // Using Number() for explicit conversion, which is robust.
    const numericalInterpretation = Number(rawInputValue);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(numericalInterpretation)) {
        printOutput(`Error: The provided input '${rawInputValue}' cannot be processed as a number.`, STANDARD_OS_MODULE.EOL);
        return; // Exit if input is not a number.
    }

    // Perform the division and floor operation.
    // Using Math.trunc for flooring, an alternative to Math.floor or bitwise operations.
    const computedResult = Math.trunc(numericalInterpretation / 3);

    // Output the final computed value.
    printOutput(computedResult);
});

const STANDARD_OS_MODULE = require('os'); // Centralized OS module import.

/**
 * Orchestrates an asynchronous program driven by a generator, managing standard I/O.
 * @param {(outputHandler: (data: string, ending?: string) => void, inputFetcher: () => IterableIterator<string|null>) => IterableIterator<any>} coreProgramLogic - The generator function containing the application's main logic.
 */
function executeProgram(coreProgramLogic) {
    // Renamed system input/output streams for clarity.
    const systemInput = process.stdin;
    const systemOutput = process.stdout;

    // Buffers to hold parsed input data.
    let inputTokenQueue = []; // Stores individual tokens (words or lines).
    let inputLineQueue = [];  // Stores complete lines read from the stream.

    let unprocessedInputSegment = ""; // Holds partial data chunks that don't form a full line yet.
    let isInputSourceExhausted = false; // Flag to indicate if the input stream has ended.

    // Constants to define how input should be parsed.
    const PARSE_MODE_LINE_BY_LINE = 0;   // Input is consumed as whole lines.
    const PARSE_MODE_TOKEN_BY_TOKEN = 1; // Input is consumed as whitespace-separated tokens.
    let currentInputParseMode = PARSE_MODE_TOKEN_BY_TOKEN; // Default parsing mode.

    /**
     * Writes provided data to the standard output stream.
     * @param {string | number} dataContent - The content to write. Will be converted to string.
     * @param {string} [lineTerminator] - Optional string to append after `dataContent`. Defaults to OS-specific end-of-line.
     */
    function outputData(dataContent, lineTerminator) {
        // Ensure dataContent is a string before writing.
        const outputString = String(dataContent);

        systemOutput.cork(); // Optimize output by buffering writes.
        // Use a template literal for cleaner string construction.
        systemOutput.write(`${outputString}${lineTerminator === undefined ? STANDARD_OS_MODULE.EOL : lineTerminator}`);
        systemOutput.uncork(); // Flush the buffered output.
    }

    /**
     * A generator function that yields input to the main program logic.
     * It abstracts whether the input comes from buffered lines or a direct yield.
     * @returns {IterableIterator<string|null>}
     */
    function* retrieveInput() {
        if (inputLineQueue.length > 0) {
            // If there are lines already buffered, return the next one.
            let nextBufferedItem = inputLineQueue.shift();

            // Optional: Handle empty or whitespace-only lines differently.
            if (nextBufferedItem !== null && nextBufferedItem.trim() === '') {
                // For this clone, we'll still return empty lines as they might be significant.
            }
            return nextBufferedItem;
        } else {
            // If no buffered lines, switch the parser mode to expect a full line from the yield.
            currentInputParseMode = PARSE_MODE_LINE_BY_LINE;
            const awaitedLine = yield; // Pause execution and wait for an external value.
            currentInputParseMode = PARSE_MODE_TOKEN_BY_TOKEN; // Reset mode after receiving line.
            return awaitedLine;
        }
    }

    // Instantiate the main application's generator.
    const programIterator = coreProgramLogic(outputData, retrieveInput);

    /**
     * Processes a raw chunk of data received from the input stream.
     * Splits it into lines and updates internal buffers.
     * @param {string|null} receivedDataChunk - The data chunk from `stdin`. `null` signals end of stream.
     */
    function processIncomingChunk(receivedDataChunk) {
        systemInput.pause(); // Temporarily pause the input stream to prevent new 'data' events.

        if (receivedDataChunk === null) {
            inputLineQueue.push(null); // Push a `null` sentinel to signal end of input to the processing loop.
        } else if (typeof receivedDataChunk === 'string') {
            unprocessedInputSegment += receivedDataChunk; // Append new data to the buffer.

            // Regular expression to find complete lines (ending with newline characters).
            const lineExtractionPattern = /.*(\r?\n|\r)/g;
            let matchResult;
            let lastProcessedPosition = 0;

            // Extract all complete lines from the `unprocessedInputSegment`.
            while ((matchResult = lineExtractionPattern.exec(unprocessedInputSegment)) !== null) {
                lastProcessedPosition = lineExtractionPattern.lastIndex;
                inputLineQueue.push(matchResult[0]); // Add the full line to the line queue.
            }
            // Retain any remaining partial data that doesn't form a complete line.
            unprocessedInputSegment = unprocessedInputSegment.substring(lastProcessedPosition);
        } else {
            // Log an error if an unexpected data type is received.
            console.error("Warning: Received unexpected data chunk type from stdin:", typeof receivedDataChunk);
            // Optionally push a null to indicate a problematic end or skip.
            inputLineQueue.push(null);
        }

        // After processing the chunk, resume the main program's processing cycle.
        initiateProcessingCycle();
    }

    /**
     * The central loop that feeds input tokens to the program generator and handles its output.
     */
    function initiateProcessingCycle() {
        let hasMoreInputToProcess = true; // Helper flag to control the outer loop.

        // Continue processing as long as there are lines in the buffer and input is available.
        while (inputLineQueue.length > 0 && hasMoreInputToProcess) {
            switch (currentInputParseMode) {
                case PARSE_MODE_LINE_BY_LINE: {
                    // If the program expects a full line, take it directly from the line queue.
                    inputTokenQueue.push(inputLineQueue.shift());
                } break;
                case PARSE_MODE_TOKEN_BY_TOKEN: {
                    // If the first item in the line queue is the `null` sentinel (end of stream).
                    if (inputLineQueue[0] === null) {
                        inputTokenQueue.push(inputLineQueue.shift()); // Pass the sentinel to the token queue.
                        hasMoreInputToProcess = false; // Signal that no more input is coming from lines.
                    } else {
                        // Regex to extract non-whitespace tokens (words).
                        const tokenExtractionPattern = /[^\s]+/g;
                        let tokenMatch;

                        // Attempt to extract a token from the current line.
                        if ((tokenMatch = tokenExtractionPattern.exec(inputLineQueue[0])) !== null) {
                            inputTokenQueue.push(tokenMatch[0]); // Add the extracted token.
                            // Update the remaining part of the line.
                            inputLineQueue[0] = inputLineQueue[0].substring(tokenExtractionPattern.lastIndex);
                        } else {
                            // If no tokens are found in the current line, discard it.
                            inputLineQueue.shift();
                        }
                    }
                } break;
                default: {
                    // Guard against an unhandled or unknown parsing mode.
                    console.error("Critical Error: Unknown input parsing mode detected:", currentInputParseMode);
                    currentInputParseMode = PARSE_MODE_TOKEN_BY_TOKEN; // Reset to a safe default.
                }
            }

            // Process any tokens that have been buffered for the generator.
            while (inputTokenQueue.length > 0) {
                // Advance the program generator with the next input token.
                const generatorExecutionResult = programIterator.next(inputTokenQueue.shift());

                // If the generator yielded a value, output it.
                if (generatorExecutionResult.value !== undefined) {
                    outputData(generatorExecutionResult.value, ""); // Explicitly output the value.
                }

                // If the generator has completed its execution, terminate the program.
                if (generatorExecutionResult.done) {
                    return; // Program finished.
                }
            }
        }

        // After exhausting current buffers, either wait for more input or signal final end.
        if (isInputSourceExhausted) {
            // If the input stream has officially ended, schedule a final chunk processing with null.
            setTimeout(() => processIncomingChunk(null), 0);
        } else {
            // Otherwise, resume the input stream to receive more data.
            systemInput.resume();
        }
    }

    // Set up event listeners for the standard input stream.
    // Added a guard to ensure process.stdin is available.
    if (systemInput) {
        systemInput.on('data', processIncomingChunk); // Process incoming data chunks.
        systemInput.on('end', () => { // Use arrow function for cleaner context.
            isInputSourceExhausted = true; // Mark input as finished.
            processIncomingChunk(null); // Process any leftover data, then signal end.
        });
    } else {
        console.warn("process.stdin object not found. Input operations might fail.");
        // If stdin is unavailable, force the program generator to complete to avoid hanging.
        programIterator.return();
        return;
    }

    // Configure the input stream to decode data as UTF-8.
    systemInput.setEncoding('utf8');

    // Initiate the processing by simulating an initial empty chunk.
    // This allows the program to start and potentially yield for input immediately.
    processIncomingChunk(null);
}