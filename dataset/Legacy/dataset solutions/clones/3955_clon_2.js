executeComputation(function* (emitOutput, retrieveInput) {
    // Retrieve the initial count of elements from the input stream.
    let numElements = +(yield);

    // Array to store the calculated differences between consecutive values.
    const differenceValues = [];
    // Variable to accumulate the sum of absolute differences.
    let totalAbsoluteSum = 0;
    // Holds the value from the previous iteration, starting at zero.
    let previousNumber = 0;

    // Loop through the specified number of elements to process input.
    for (let loopCounter = 0; loopCounter < numElements; ++loopCounter) {
        // Fetch the next numerical value from the input.
        let currentNumber = +(yield);
        // Calculate the difference between the previous and current numbers.
        let currentDifference = previousNumber - currentNumber;
        differenceValues.push(currentDifference);
        totalAbsoluteSum += Math.abs(currentDifference);
        // Update the previous number for the subsequent iteration.
        previousNumber = currentNumber;
    }

    // After the main loop, calculate the final difference from the last number to zero.
    let finalDifference = previousNumber - 0;
    differenceValues.push(finalDifference);
    totalAbsoluteSum += Math.abs(finalDifference);

    // A string buffer to construct the final output.
    let outputAccumulator = "";

    // Iterate again to compute and append the results based on the problem's specific formula.
    for (let loopCounter = 0; loopCounter < numElements; ++loopCounter) {
        // The formula is: totalAbsoluteSum - |diff_i| - |diff_{i+1}| + |diff_i + diff_{i+1}|
        let termA = totalAbsoluteSum;
        let termB = Math.abs(differenceValues[loopCounter]);
        let termC = Math.abs(differenceValues[loopCounter + 1]);
        let termD = Math.abs(differenceValues[loopCounter] + differenceValues[loopCounter + 1]);
        outputAccumulator += (termA - termB - termC + termD);
        outputAccumulator += os.EOL; // Append the system's standard end-of-line character.
    }
    // Output the complete accumulated string to the console.
    console.log(outputAccumulator);
});

/**
 * This higher-order function provides a runtime environment for a generator-based
 * program, managing asynchronous standard input and output operations.
 *
 * @param {(emitOutput: (textLine: string, endingChar?: string) => void, retrieveInput: () => IterableIterator<string|null>) => IterableIterator<any>} coreLogicGenerator
 *   The main program logic, implemented as a generator function. It receives
 *   `emitOutput` for writing and `retrieveInput` for reading.
 */
function executeComputation(coreLogicGenerator) {
    const inputPipe = process.stdin; // Reference to the standard input stream.
    const outputPipe = process.stdout; // Reference to the standard output stream.

    /**
     * @type {Array<string|null>}
     * A buffer for individual tokens (words or lines) ready to be consumed by the generator.
     */
    const tokenBuffer = [];
    /**
     * @type {Array<string|null>}
     * A buffer for complete lines extracted from incoming data chunks.
     */
    const lineBuffer = [];
    let partialLine = ""; // Stores any incomplete line data from the last chunk.
    let inputEnded = false; // Flag indicating if the input stream has signaled its end.

    // Constants defining the input reading modes.
    const LINE_MODE = 0; // Input is expected as full lines.
    const WORD_MODE = 1; // Input is expected as space-separated words.
    let currentInputMode = WORD_MODE; // The current mode for parsing input.

    /**
     * Writes a given string to the standard output stream.
     *
     * @param {string} textLine The string content to be written.
     * @param {string} [endingChar] Optional string to append at the end of `textLine`.
     *   If not provided, `os.EOL` (system's default newline) is used.
     */
    function emitOutput(textLine, endingChar) {
        outputPipe.write(textLine + (undefined === endingChar ? os.EOL : endingChar));
    }

    /**
     * A generator function that provides input to the `coreLogicGenerator`.
     * It retrieves data from `lineBuffer` or yields to wait for a full line.
     *
     * @returns {IterableIterator<string|null>} An iterator yielding input strings or null for EOF.
     */
    function* retrieveInput() {
        if (lineBuffer.length > 0) {
            // If there are lines buffered, return the first one.
            return lineBuffer.shift();
        } else {
            // If no lines are buffered, switch to LINE_MODE and wait for the next yielded value.
            currentInputMode = LINE_MODE;
            /**
             * @type {string|null}
             * The line received from the main generator's `next()` call.
             */
            const yieldedLine = yield;
            currentInputMode = WORD_MODE; // Revert to WORD_MODE after receiving a line.
            return yieldedLine;
        }
    }

    // Instantiate the main generator, passing the I/O functions.
    const logicIteratorInstance = coreLogicGenerator(emitOutput, retrieveInput);

    /**
     * Processes an incoming data chunk from the standard input stream.
     * This function is typically called by the 'data' event listener.
     *
     * @param {string|null} incomingChunk The data chunk received, or `null` if the stream has ended.
     */
    function handleDataChunk(incomingChunk) {
        inputPipe.pause(); // Temporarily pause the input stream to prevent data overflow.

        if (null === incomingChunk) {
            lineBuffer.push(null); // Signal end-of-file by pushing a null into the line buffer.
        } else {
            partialLine += incomingChunk; // Append the new chunk to any existing partial data.
            const lineSeparatorRegex = /.*(\r?\n|\r)/g; // Regular expression to find complete lines.
            let lineMatchResult;
            let lastMatchPosition = 0;

            // Extract all complete lines from the `partialLine` buffer.
            while (null !== (lineMatchResult = lineSeparatorRegex.exec(partialLine))) {
                lastMatchPosition = lineSeparatorRegex.lastIndex;
                lineBuffer.push(lineMatchResult[0]);
            }
            partialLine = partialLine.substring(lastMatchPosition); // Keep any remaining partial data.
        }
        processBuffers(); // Continue processing the buffered data.
    }

    /**
     * The core loop that processes data from `lineBuffer` and `tokenBuffer`,
     * feeding it to the `logicIteratorInstance`.
     */
    function processBuffers() {
        while (lineBuffer.length > 0) {
            switch (currentInputMode) {
                case LINE_MODE:
                    // If in LINE_MODE, simply move the next line to the token buffer.
                    tokenBuffer.push(lineBuffer.shift());
                    break;
                case WORD_MODE:
                    // If in WORD_MODE, extract words from the current line.
                    if (null === lineBuffer[0]) {
                        tokenBuffer.push(lineBuffer.shift()); // Handle null (EOF) line.
                    } else {
                        const wordExtractorRegex = /[^\s]+/g; // Regex to find non-whitespace sequences (words).
                        let wordMatchResult;
                        if (null !== (wordMatchResult = wordExtractorRegex.exec(lineBuffer[0]))) {
                            tokenBuffer.push(wordMatchResult[0]); // Add the extracted word to the token buffer.
                            // Remove the extracted word from the current line in the buffer.
                            lineBuffer[0] = lineBuffer[0].substring(wordExtractorRegex.lastIndex);
                        } else {
                            lineBuffer.shift(); // If no words are found, discard the line.
                        }
                    }
                    break;
            }

            // Process tokens from the `tokenBuffer` and feed them to the main generator.
            while (tokenBuffer.length > 0) {
                const generatorResult = logicIteratorInstance.next(tokenBuffer.shift());
                if (undefined !== generatorResult.value) {
                    // If the generator yielded a value, output it.
                    if ('string' === typeof generatorResult.value) {
                        emitOutput(generatorResult.value, "");
                    } else {
                        emitOutput(`${generatorResult.value}`, "");
                    }
                }
                if (generatorResult.done) return; // If the generator has finished, exit.
            }
        }

        // If both buffers are empty, either schedule a null chunk if input has ended,
        // or resume the input stream to receive more data.
        inputEnded ? setTimeout(handleDataChunk, 0, null) : inputPipe.resume();
    }

    // Attach event listeners to the standard input stream.
    inputPipe.on('data', handleDataChunk);
    inputPipe.on('end', function () {
        inputEnded = true; // Set the flag to indicate input stream has ended.
        handleDataChunk(null); // Process any remaining data and signal EOF.
    });

    // Set the character encoding for the input stream.
    inputPipe.setEncoding('utf8');
    // Initial call to `handleDataChunk` with null to kickstart the process,
    // especially for cases with immediate EOF or no initial data event.
    handleDataChunk(null);
}

// Import the 'os' module to access operating system-specific utilities,
// such as the end-of-line character.
const os = require('os');
