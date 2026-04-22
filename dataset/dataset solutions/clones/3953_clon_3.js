const systemUtils = require('os');

/**
 * Orchestrates the execution of a generator-based application logic,
 * managing input and output streams for a console-based program.
 * It provides `emitOutput` for writing and `fetchInput` for reading.
 * @param {(emitOutput: (content: string, terminator?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} applicationLogic - The main program logic, implemented as a generator function.
 */
function executeProgram(applicationLogic) {
    const inputSource = process.stdin;
    const outputSink = process.stdout;

    // A buffer to hold parsed input tokens (either words or full lines) ready for the application logic.
    const inputTokensBuffer = [];
    // A buffer to hold raw lines extracted from incoming data chunks.
    const inputLinesBuffer = [];
    // Stores any partial line data that remains after processing an input chunk.
    let remainingBuffer = "";
    // A flag indicating whether the input stream has signaled its end.
    let inputFinished = false;

    // Define distinct modes for reading input, using strings for better clarity.
    const READ_MODE_LINE = "LINE_BY_LINE"; // Application expects a full line.
    const READ_MODE_TOKEN = "WORD_BY_WORD"; // Application expects a single word/token.
    let currentReadMode = READ_MODE_TOKEN; // The default reading mode when the program starts.

    // Retrieve the system's default end-of-line character sequence for output consistency.
    const LINE_TERMINATOR = systemUtils.EOL;

    /**
     * Writes provided content to the output stream, followed by an optional terminator.
     * If no terminator is specified, the system's default EOL is used.
     * @param {string} content - The string content to be written to the output.
     * @param {string} [terminator] - An optional string to append after the content.
     */
    function emitOutput(content, terminator) {
        // Ensure the content is treated as a string, converting if necessary.
        const formattedContent = String(content);
        // Determine the actual terminator to use.
        const outputTerminator = (terminator === undefined) ? LINE_TERMINATOR : terminator;
        outputSink.write(formattedContent + outputTerminator);
    }

    /**
     * A generator function that the application logic uses to request input.
     * It sets the current input reading mode and yields control until input is available.
     * @returns {IterableIterator<string|null>} A generator that will yield the requested input segment.
     */
    function* fetchInput() {
        // When the application requests input via `yield`, it implies it needs a full line.
        // Set the mode accordingly so `processInputQueue` knows how to prepare the next input.
        currentReadMode = READ_MODE_LINE;
        // Yield control. The value passed to `logicIterator.next()` will be received here.
        const receivedSegment = yield;
        // After receiving the input, reset the mode back to default (word-by-word) for subsequent requests.
        currentReadMode = READ_MODE_TOKEN;
        return receivedSegment;
    }

    // Initialize the main application logic by creating its generator iterator.
    const logicIterator = applicationLogic(emitOutput, fetchInput);

    /**
     * Handles incoming data chunks from the input stream. It buffers the data,
     * splits it into complete lines, and then triggers the queue processing.
     * @param {string|null} dataChunk - A string representing a piece of data, or null if the stream has ended.
     */
    function processIncomingData(dataChunk) {
        inputSource.pause(); // Temporarily pause the input stream to manage current data.

        if (dataChunk === null) {
            // If the chunk is null, it signifies the end of the input stream.
            inputLinesBuffer.push(null); // Add a null marker to the lines buffer.
        } else {
            // Append the new data chunk to any existing partial data.
            remainingBuffer += dataChunk;
            // Regular expression to find lines ending with any standard line break.
            const lineExtractorRegex = /.*(\r?\n|\r)/g;
            let lineMatchResult;
            let lastMatchedIndex = 0;

            // Iterate through the buffer to extract all complete lines.
            while ((lineMatchResult = lineExtractorRegex.exec(remainingBuffer)) !== null) {
                lastMatchedIndex = lineExtractorRegex.lastIndex;
                inputLinesBuffer.push(lineMatchResult[0]); // Store the full line, including its terminator.
            }
            // Keep any remaining part of the buffer that doesn't form a complete line.
            remainingBuffer = remainingBuffer.substring(lastMatchedIndex);
        }
        // After processing the incoming chunk, attempt to feed buffered data to the application.
        processInputQueue();
    }

    /**
     * This function continuously processes buffered input (lines or tokens)
     * and feeds it to the application logic until the logic is done or
     * more external input is required.
     */
    function processInputQueue() {
        // Continue as long as there are raw lines buffered from the input stream.
        while (inputLinesBuffer.length > 0) {
            switch (currentReadMode) {
                case READ_MODE_LINE:
                    // If the application is waiting for a full line, take the first buffered line.
                    inputTokensBuffer.push(inputLinesBuffer.shift());
                    break;
                case READ_MODE_TOKEN:
                    // If the application is waiting for a single word/token.
                    const currentLineForToken = inputLinesBuffer[0];
                    if (currentLineForToken === null) {
                        // If the current line is the EOF marker, pass it directly.
                        inputTokensBuffer.push(inputLinesBuffer.shift());
                    } else {
                        // Regular expression to find the next sequence of non-whitespace characters (a "word").
                        // This regex is created here to ensure `lastIndex` is always reset for a new line.
                        const tokenPattern = /[^\s]+/g;
                        let tokenMatch;
                        if ((tokenMatch = tokenPattern.exec(currentLineForToken)) !== null) {
                            inputTokensBuffer.push(tokenMatch[0]); // Add the found token to the output buffer.
                            // Update the line in the buffer by removing the consumed token and any preceding whitespace.
                            inputLinesBuffer[0] = currentLineForToken.substring(tokenPattern.lastIndex);
                            // If the line becomes empty (or just whitespace) after token extraction, remove it.
                            if (inputLinesBuffer[0].trim().length === 0) {
                                inputLinesBuffer.shift();
                            }
                        } else {
                            // If no tokens were found on the current line (e.g., it was an empty or whitespace-only line),
                            // discard the line and move to the next one.
                            inputLinesBuffer.shift();
                        }
                    }
                    break;
                default:
                    // This case should ideally not be reached, indicating an unexpected state.
                    console.error("Critical Error: Unknown input reading mode detected:", currentReadMode);
                    // To prevent an infinite loop, discard the current line in an error state.
                    inputLinesBuffer.shift();
                    break;
            }

            // Now, feed the prepared tokens from `inputTokensBuffer` to the application logic.
            while (inputTokensBuffer.length > 0) {
                const nextInputSegment = inputTokensBuffer.shift();
                // Advance the generator, passing the next input segment.
                const generatorResult = logicIterator.next(nextInputSegment);

                // If the generator yielded a value, output it immediately.
                if (generatorResult.value !== undefined && generatorResult.value !== null) {
                    // Convert the yielded value to a string and output it without an additional line break.
                    emitOutput(String(generatorResult.value), "");
                }

                // If the generator has indicated it's done, the application logic has completed.
                if (generatorResult.done) {
                    // No further processing is required for this program execution.
                    return;
                }
            }
        }

        // If the input stream has finished AND there's no more buffered data,
        // signal a final EOF to the processing function after a brief delay
        // to allow the event loop to clear. Otherwise, resume the input stream
        // to wait for more data.
        inputFinished ? setTimeout(processIncomingData, 0, null) : inputSource.resume();
    }

    // Attach event handlers to the input stream.
    // 'data' event: Fired when new data chunks are available.
    inputSource.on('data', processIncomingData);
    // 'end' event: Fired when the input stream has closed.
    inputSource.on('end', () => {
        inputFinished = true; // Mark the input stream as fully consumed.
        processIncomingData(null); // Process any remaining data and signal the end of file.
    });

    // Configure the input stream to interpret incoming bytes as UTF-8 characters.
    inputSource.setEncoding('utf8');
    // Kick-start the input processing. This call attempts to process any data
    // already in the buffer or immediately signals EOF if the stream is already closed.
    processIncomingData(null);
}

// The core application logic, encapsulated in a generator function.
executeProgram(function* (emitOutput, fetchInput) {
    // Read the total number of data points expected from the input.
    // The `+` operator attempts to convert the yielded string to a number.
    const numPoints = +(yield fetchInput());

    // Guard clause: If the number of points is invalid (not a number or non-positive),
    // output an empty string and terminate early.
    if (isNaN(numPoints) || numPoints <= 0) {
        emitOutput("");
        return;
    }

    // An array to store the differences between consecutive values.
    const differenceArray = [];
    // A running total of the absolute deviations between consecutive values.
    let deviationSum = 0;
    // Holds the previous numeric value encountered in the sequence.
    let previousValue = 0; // The problem implies starting from 0.

    // Helper function for calculating absolute values to reduce repetition.
    const computeAbsolute = Math.abs;

    // First loop: Process each input point to calculate differences and the total deviation.
    for (let currentIdx = 0; currentIdx < numPoints; ++currentIdx) {
        // Fetch the next numeric value from the input stream.
        const currentValue = +(yield fetchInput());

        // Calculate the difference from the previous value.
        const currentDifference = previousValue - currentValue;
        differenceArray.push(currentDifference);

        // Add the absolute difference to the running total deviation.
        deviationSum += computeAbsolute(currentDifference);

        // Update the previous value for the next iteration.
        previousValue = currentValue;
    }

    // After the loop, calculate the final difference with an implied endpoint of 0,
    // and add its absolute value to the total deviation.
    const finalDifference = previousValue - 0;
    differenceArray.push(finalDifference);
    deviationSum += computeAbsolute(finalDifference);

    // Initialize a string builder to construct the final output.
    let resultBuilder = "";

    // Second loop: Calculate the specific sum based on the differences array.
    // The formula: `total - abs(A) - abs(B) + abs(A + B)` is used here.
    for (let currentIdx = 0; currentIdx < numPoints; ++currentIdx) {
        const diffA = differenceArray[currentIdx];
        const diffB = differenceArray[currentIdx + 1];

        // Break down the calculation for clarity.
        const absDiffA = computeAbsolute(diffA);
        const absDiffB = computeAbsolute(diffB);
        const absSumOfDiffs = computeAbsolute(diffA + diffB);

        // Apply the formula to determine the contribution for the current step.
        const currentContribution = deviationSum - absDiffA - absDiffB + absSumOfDiffs;
        resultBuilder += currentContribution;
    }

    // Output the final computed string.
    emitOutput(resultBuilder);
});