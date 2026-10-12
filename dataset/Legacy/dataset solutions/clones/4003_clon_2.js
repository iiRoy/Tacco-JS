executeProcessor(function * (outputLine, fetchInput) {
    // Obtain an integer from the yielded input.
    let inputNumber = Number.parseInt(yield, 0xA);
    // Output the floor division result.
    outputLine(Math.floor(inputNumber / 3));
});

// This function orchestrates the execution of a generator-based primaryProcessor.
function executeProcessor(primaryProcessor) {
    // Standard input and output streams.
    const inputStream = process.stdin;
    const outputStream = process.stdout;

    // Buffers for processing input.
    let inputTokens = []; // Stores individual words/tokens.
    let bufferedLines = []; // Stores complete lines from input.
    let remainingBuffer = ''; // Holds partial line data.
    let processingFinished = false; // Flag to indicate end of input.

    // Input processing modes.
    const LINE_READ_MODE = 0x0; // Mode for reading full lines.
    const TOKEN_READ_MODE = 0b1; // Mode for reading individual tokens/words.
    let currentInputMode = TOKEN_READ_MODE; // Initial input mode.

    // Function to write data to the output stream.
    function emitOutput(content, terminator) {
        outputStream.cork(); // Optimize writes by buffering.
        outputStream.write(content + (void 0 === terminator ? systemOS.EOL : terminator));
        outputStream.uncork(); // Flush buffered writes.
    }

    // Generator function to retrieve input.
    function *retrieveInput() {
        if (bufferedLines.length > 0) {
            return bufferedLines.shift(); // Return buffered line if available.
        } else {
            currentInputMode = LINE_READ_MODE; // Switch to line mode.
            let receivedLine = yield; // Pause and wait for a line.
            currentInputMode = TOKEN_READ_MODE; // Switch back to token mode.
            return receivedLine;
        }
    }

    // Initialize the primary processor's iterator.
    const processorIterator = primaryProcessor(emitOutput, retrieveInput);

    // Function to handle incoming data chunks from stdin.
    function processDataChunk(dataSegment) {
        inputStream.pause(); // Temporarily pause the input stream.
        if (dataSegment === null) {
            bufferedLines.push(null); // Mark end of input.
        } else {
            remainingBuffer += dataSegment; // Append new data to buffer.
            const lineRegex = /.*(\r?\n|\r)/g; // Regex to find complete lines.
            let lineMatchResult;
            let lastProcessedIndex = 0x0;
            while ((lineMatchResult = lineRegex.exec(remainingBuffer)) !== null) {
                lastProcessedIndex = lineRegex.lastIndex;
                bufferedLines.push(lineMatchResult[0]); // Add complete line to buffer.
            }
            remainingBuffer = remainingBuffer.substring(lastProcessedIndex); // Keep remaining partial data.
        }
        processingLoop(); // Continue processing buffered data.
    }

    // Main processing loop.
    function processingLoop() {
        while (bufferedLines.length > 0) {
            switch (currentInputMode) {
                case LINE_READ_MODE: {
                    inputTokens.push(bufferedLines.shift()); // Move line to tokens.
                }
                break;
                case TOKEN_READ_MODE: {
                    if (bufferedLines[0] === null) {
                        inputTokens.push(bufferedLines.shift()); // Handle end-of-input marker.
                    } else {
                        const wordRegex = /[^\s]+/g; // Regex to find words.
                        let tokenMatchResult;
                        if ((tokenMatchResult = wordRegex.exec(bufferedLines[0])) !== null) {
                            inputTokens.push(tokenMatchResult[0]); // Add word to tokens.
                            bufferedLines[0] = bufferedLines[0].substring(wordRegex.lastIndex); // Remove processed word.
                        } else {
                            bufferedLines.shift(); // No words found, discard line.
                        }
                    }
                }
                break;
            }

            while (inputTokens.length > 0) {
                let iteratorResult = processorIterator.next(inputTokens.shift()); // Advance processor with next token.
                if (iteratorResult.value !== void 0) { // Check if there's a value to output.
                    if (typeof iteratorResult.value === 'string') {
                        emitOutput(iteratorResult.value, ''); // Output string directly.
                    } else {
                        emitOutput(`${iteratorResult.value}`, ''); // Convert and output other types.
                    }
                }
                if (iteratorResult.done) return; // If processor is done, exit.
            }
        }

        // If no more buffered lines, either schedule end-of-input or resume stream.
        processingFinished ? setTimeout(processDataChunk, 0x0, null) : process.stdin.resume();
    }

    // Set up event listeners for input stream.
    process.stdin.on('data', processDataChunk);
    process.stdin.on('end', function () {
        processingFinished = true; // Mark input as ended.
        processDataChunk(null); // Process any remaining data and signal end.
    });

    // Configure input stream encoding.
    process.stdin.setEncoding('utf8');
    // Initiate the first chunk processing to start the loop.
    processDataChunk(null);
}

const systemOS = require('os');
