// Define a utility constant for end-of-line character, avoiding an external 'os' dependency.
const SYSTEM_LINE_ENDING = '\n'; 

// The core application logic, now a named generator function.
function* tilePatternGenerator(displayOutput, requestInput) {
    // Acquire initial parameters for tile counts.
    // Type II change: Renaming, explicit Number conversion for robustness.
    // Type III change: Added validation for non-negative inputs and default handling.
    let initialLightTileCount = Number(yield);
    let initialDarkTileCount = Number(yield);

    // Guard clauses for invalid or negative input counts.
    if (isNaN(initialLightTileCount) || initialLightTileCount < 0) {
        console.error("Warning: Invalid or negative light tile count provided. Defaulting to 0.");
        initialLightTileCount = 0;
    }
    if (isNaN(initialDarkTileCount) || initialDarkTileCount < 0) {
        console.error("Warning: Invalid or negative dark tile count provided. Defaulting to 0.");
        initialDarkTileCount = 0;
    }

    const GRID_WIDTH_CELLS = 100; // Type III: Introduced a constant for the magic number 100.
    const SEGMENT_PAIR_COUNT = GRID_WIDTH_CELLS / 2; // Number of two-character segments per row.

    // Buffer to store all generated rows.
    const generatedPatternRows = [];

    // Type III: Extracted common pattern generation logic into a helper function.
    // This function generates a pair of lines based on a mutable count reference and pattern definitions.
    const createPatternLinePair = (countTracker, activeTopPattern, activeBottomPattern, defaultTopPattern, defaultBottomPattern) => {
        let currentTopRowSegment = '';
        let currentBottomRowSegment = '';

        for (let segmentIdx = 0; segmentIdx < SEGMENT_PAIR_COUNT; ++segmentIdx) {
            if (countTracker.remaining > 0) {
                currentTopRowSegment += activeTopPattern;
                currentBottomRowSegment += activeBottomPattern;
                countTracker.remaining--; // Decrement the count via reference.
            } else {
                currentTopRowSegment += defaultTopPattern;
                currentBottomRowSegment += defaultBottomPattern;
            }
        }
        return [currentTopRowSegment, currentBottomRowSegment];
    };

    // Type III: Using objects for count references to allow modification within the helper.
    // This is a structural change to how state is managed and passed.
    const lightTileCounter = { remaining: initialLightTileCount };
    const darkTileCounter = { remaining: initialDarkTileCount };

    // First phase: Generate lines for light tiles.
    // Type II: Changed `do...while` to `while` with an initial check,
    // and rephrased the condition for clarity.
    while (lightTileCounter.remaining > 0 || generatedPatternRows.length === 0) { // Ensures at least one pass if count is 0
        const [topRow, bottomRow] = createPatternLinePair(
            lightTileCounter,
            ".#", "##", // Patterns for active light tiles
            "##", "##"  // Default patterns when light tiles run out
        );
        generatedPatternRows.push(topRow, bottomRow);
        if (lightTileCounter.remaining <= 0) break; // Exit after first pass if no more light tiles
    }

    // Second phase: Generate lines for dark tiles.
    // Type II: Changed `do...while` to `while` with an initial check,
    // and rephrased the condition.
    while (darkTileCounter.remaining > 0 || generatedPatternRows.length === 0) { // Ensures at least one pass if count is 0
        const [topRow, bottomRow] = createPatternLinePair(
            darkTileCounter,
            "..", "#.", // Patterns for active dark tiles
            "..", ".."  // Default patterns when dark tiles run out
        );
        generatedPatternRows.push(topRow, bottomRow);
        if (darkTileCounter.remaining <= 0) break; // Exit after first pass if no more dark tiles
    }

    // Output the dimensions of the generated grid.
    // Type II: Changed string interpolation and variable names.
    displayOutput(`${generatedPatternRows.length} ${GRID_WIDTH_CELLS}`);

    // Iterate through the collected rows and output them.
    // Type II: Changed `for` loop syntax, increment style, and variable names.
    for (let rowIdx = 0; rowIdx < generatedPatternRows.length; ++rowIdx) {
        displayOutput(generatedPatternRows[rowIdx]);
    }
}

// Type III: Encapsulating the asynchronous input/output runner logic within a class.
// This significantly changes the structure from a standalone function with closures
// to an object-oriented approach, making the state explicit class members.
class AsyncInputOutputHandler {
    /**
     * @param {(writer: (line: string, end?: string) => void, getter: () => IterableIterator<any>) => IterableIterator<any>} mainGeneratorFunction - The application's core generator logic.
     * @param {NodeJS.ReadableStream} inputSourceStream - The stream from which to read input (e.g., process.stdin).
     * @param {NodeJS.WritableStream} outputSinkStream - The stream to which to write output (e.g., process.stdout).
     */
    constructor(mainGeneratorFunction, inputSourceStream, outputSinkStream) {
        this.inputSource = inputSourceStream;
        this.outputSink = outputSinkStream;
        this.partialInputBuffer = ''; // Stores incomplete line data from chunks.
        this.streamHasEnded = false;

        this.bufferedInputLines = []; // Stores full lines parsed from input chunks.
        this.readyInputTokens = [];   // Stores individual tokens/lines ready for the generator.

        // Input processing modes definitions.
        this.INPUT_MODE_LINE_BY_LINE = 0;
        this.INPUT_MODE_TOKENIZED = 1;
        this.currentInputProcessingMode = this.INPUT_MODE_TOKENIZED; // Default to word/token mode.

        // Bind 'this' context to methods that will be used as event callbacks.
        this.processIncomingDataChunk = this.processIncomingDataChunk.bind(this);
        this.executeProcessingLoop = this.executeProcessingLoop.bind(this);
        this.handleStreamTermination = this.handleStreamTermination.bind(this);

        // Initialize and start the main application generator.
        this.applicationIterator = mainGeneratorFunction(
            this.writeToOutputStream.bind(this),
            this.retrieveNextInputUnit.bind(this)
        );

        this.configureStreamListeners(); // Set up input stream event handlers.
    }

    /**
     * Writes content to the output stream.
     * @param {string} content - The string content to write.
     * @param {string | null} [terminator] - Optional line terminator. Defaults to SYSTEM_LINE_ENDING if undefined or null.
     */
    writeToOutputStream(content, terminator) {
        // Type II: Explicitly checking for undefined or null for the terminator.
        const effectiveTerminator = (terminator === undefined || terminator === null) ? SYSTEM_LINE_ENDING : terminator;
        this.outputSink.write(content + effectiveTerminator);
    }

    /**
     * Generator function to retrieve the next input token or line.
     * It pauses execution until input is available or an explicit value is passed back.
     * @yields {string | null} The next piece of input (line or token).
     */
    *retrieveNextInputUnit() {
        // Type II: Renamed variables and functions for clarity.
        // Type III: Added a check for empty buffered lines and explicit null handling.
        if (this.bufferedInputLines.length > 0) {
            const nextBufferedItem = this.bufferedInputLines.shift();
            // If the shifted item is null (EOF marker), return it immediately.
            if (nextBufferedItem === null) {
                return null;
            }
            // Otherwise, set mode and yield.
            this.currentInputProcessingMode = this.INPUT_MODE_TOKENIZED;
            return nextBufferedItem;
        } else {
            this.currentInputProcessingMode = this.INPUT_MODE_LINE_BY_LINE;
            /** @type {string | null} */
            const yieldedInput = yield; // Pause execution, waiting for input.
            this.currentInputProcessingMode = this.INPUT_MODE_TOKENIZED;
            return yieldedInput;
        }
    }

    /**
     * Processes an incoming data chunk from the input stream.
     * @param {string | null} receivedDataBlock - The data chunk or null for end of stream.
     */
    processIncomingDataChunk(receivedDataBlock) {
        this.inputSource.pause(); // Pause stream to prevent data overflow during processing.

        if (receivedDataBlock === null) {
            this.bufferedInputLines.push(null); // Mark end of input in the buffer.
        } else {
            this.partialInputBuffer += receivedDataBlock;
            // Type II: Renamed regex and variables.
            // Type III: Changed regex to be more robust for different line endings and edge cases.
            // This regex captures the line content before any line break, or the entire buffer if no line break.
            const lineSeparatorPattern = /(.*?)(?:\r?\n|\r|$)/g;
            let currentLineMatchResult;
            let lastScanPosition = 0;

            while ((currentLineMatchResult = lineSeparatorPattern.exec(this.partialInputBuffer)) !== null) {
                // Only push complete lines or the final partial line if it's not just a line ending.
                // If it's the end of the buffer and a line ending was matched, or if there's actual content.
                const lineContent = currentLineMatchResult[1];
                const matchedLength = currentLineMatchResult[0].length;
                const isEndOfBuffer = (lineSeparatorPattern.lastIndex === this.partialInputBuffer.length);
                const hasLineBreak = matchedLength > lineContent.length;

                if (hasLineBreak || (isEndOfBuffer && lineContent.length > 0)) {
                    this.bufferedInputLines.push(lineContent);
                }
                lastScanPosition = lineSeparatorPattern.lastIndex;

                // If the regex matched an empty string at the end of the buffer (e.g., empty line),
                // break to avoid infinite loops if it doesn't advance `lastIndex`.
                if (matchedLength === 0 && isEndOfBuffer) {
                    break;
                }
            }
            this.partialInputBuffer = this.partialInputBuffer.substring(lastScanPosition);
        }
        this.executeProcessingLoop(); // Continue processing after the chunk is handled.
    }

    /**
     * Configures event listeners for the input stream.
     */
    configureStreamListeners() {
        this.inputSource.on('data', this.processIncomingDataChunk);
        this.inputSource.on('end', this.handleStreamTermination);
        this.inputSource.setEncoding('utf8');
        // Type III: Initial call to processIncomingDataChunk moved to constructor/init.
        // It's called with null initially to kickstart the generator if no input has arrived yet.
        this.processIncomingDataChunk(null); // Process any initial buffered data or immediately yield for input.
    }

    /**
     * Handles the 'end' event from the input stream, marking it as finished.
     */
    handleStreamTermination() {
        this.streamHasEnded = true;
        // Type III: Using setImmediate for better async control than setTimeout(0),
        // ensuring the final 'null' chunk is processed asynchronously.
        setImmediate(() => this.processIncomingDataChunk(null));
    }

    /**
     * The main event loop for processing buffered input and feeding the generator.
     * It runs as long as there's data in the buffer or the generator is active.
     */
    executeProcessingLoop() {
        // Type II: Renamed variables and functions.
        while (this.bufferedInputLines.length > 0) {
            const nextBufferedLine = this.bufferedInputLines.shift(); // Get next line from buffer.

            // Type III: Refactored input parsing logic into a dedicated helper method.
            this.parseLineIntoTokens(nextBufferedLine);

            // Feed tokens to the generator as long as they are available.
            while (this.readyInputTokens.length > 0) {
                const nextTokenForGenerator = this.readyInputTokens.shift();
                const generatorExecutionResult = this.applicationIterator.next(nextTokenForGenerator);

                if (generatorExecutionResult.value !== undefined) {
                    // Type III: Added a guard for various primitive types and explicit conversion to string.
                    if (typeof generatorExecutionResult.value === 'string' || typeof generatorExecutionResult.value === 'number' || typeof generatorExecutionResult.value === 'boolean') {
                        this.writeToOutputStream(String(generatorExecutionResult.value), ""); // Write yielded value without default terminator.
                    } else {
                        // Type III: Added error logging for unexpected yield types, providing better debugging.
                        console.error("Warning: Generator yielded an unexpected type:", typeof generatorExecutionResult.value, generatorExecutionResult.value);
                        this.writeToOutputStream(JSON.stringify(generatorExecutionResult.value), ""); // Attempt to serialize complex types.
                    }
                }
                if (generatorExecutionResult.done) {
                    // console.log("Application logic completed successfully."); // Optional: Add success message.
                    return; // Application generator has finished execution.
                }
            }
        }

        // If no more buffered lines, either signal end or resume stream for more data.
        if (this.streamHasEnded) {
            // Type III: Ensures that if the stream ended, the generator receives a final 'null'
            // if it's still waiting for input, allowing it to complete gracefully.
            if (this.readyInputTokens.length === 0 && this.bufferedInputLines.length === 0) {
                 const generatorFinalResult = this.applicationIterator.next(null);
                 if (generatorFinalResult.value !== undefined) {
                    this.writeToOutputStream(String(generatorFinalResult.value), "");
                }
                if (generatorFinalResult.done) return;
            }
        } else {
            this.inputSource.resume(); // Resume stream to request more data.
        }
    }

    /**
     * Parses a line from the input buffer into individual tokens based on the current processing strategy.
     * @param {string | null} lineContent - The line to parse or null for EOF.
     */
    parseLineIntoTokens(lineContent) {
        if (lineContent === null) {
            this.readyInputTokens.push(null); // Propagate EOF marker to the token queue.
            return;
        }

        switch (this.currentInputProcessingMode) {
            case this.INPUT_MODE_LINE_BY_LINE:
                this.readyInputTokens.push(lineContent);
                break;
            case this.INPUT_MODE_TOKENIZED:
                // Type II: Renamed regex and variables.
                // Type III: Used split and filter for more robust tokenization,
                // handling multiple spaces and empty strings effectively.
                const tokens = lineContent.split(/\s+/).filter(token => token.length > 0);
                if (tokens.length > 0) {
                    this.readyInputTokens.push(...tokens);
                }
                // If a line was entirely whitespace, it might not produce tokens,
                // but it's still considered 'consumed'.
                break;
            default:
                // Type III: Added error handling for unknown input strategies, improving robustness.
                console.error("Error: Unknown input processing strategy:", this.currentInputProcessingMode);
                this.readyInputTokens.push(lineContent); // Fallback: treat as a single line.
                break;
        }
    }
}

// Global runner function to initialize the AsyncInputOutputHandler and start the application.
// Type II: Renamed.
// Type III: Changed to instantiate the class instead of calling a functional 'run'.
function executeApplication(mainGenerator) {
    // Type III: Pass process.stdin and process.stdout explicitly to the class constructor.
    new AsyncInputOutputHandler(mainGenerator, process.stdin, process.stdout);
}

// Execute the main application logic by passing the generator function.
executeApplication(tilePatternGenerator);