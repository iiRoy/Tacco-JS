process.stdin.setEncoding('utf8');

// Initiates the input stream management, feeding tokens to the provided generator.
startStreamProcessor(function * () {
    // Await the first available token from the input stream.
    // This token is expected to be a numeric sequence represented as a string.
    const inputStringValue = yield;

    // Perform validation on the received input token.
    // Ensure it's a non-empty string to avoid errors in subsequent operations.
    if (typeof inputStringValue !== 'string' || inputStringValue.length === 0) {
        console.error("Input Error: The provided sequence is either not a string or is empty. Cannot process.");
        // If the input is invalid, gracefully exit the generator's execution path.
        return;
    }

    // Extract the very first character from the input string.
    const leadingCharacter = inputStringValue.charAt(0);
    // Calculate the length of the string excluding the first character.
    const remainingDigitsCount = inputStringValue.length - 1;

    // Define constants for the specific arithmetic operation.
    const baseMultiplier = 9;
    const adjustmentFactor = 1;

    // Convert the leading character to an integer.
    // This is crucial for performing arithmetic operations correctly.
    const numericLeadingChar = parseInt(leadingCharacter, 10);

    // Perform the intermediate multiplication step.
    const intermediateProduct = remainingDigitsCount * baseMultiplier;
    // Execute the final addition and subtraction to get the computed value.
    const finalComputedValue = intermediateProduct + (numericLeadingChar - adjustmentFactor);

    // Output the final calculated result to standard output.
    console.log(finalComputedValue);
});

/**
 * Orchestrates the flow of standard input data into a JavaScript Generator function.
 * This utility handles reading chunks from `process.stdin`, tokenizing them by
 * whitespace, and sequentially feeding these tokens to the `processingGenerator`.
 * It manages pausing/resuming the input stream and writing any yielded values
 * from the generator back to `process.stdout`.
 *
 * @param {GeneratorFunction} processingGenerator - The generator function that
 *        contains the core logic, expecting input via `yield` and potentially
 *        producing output.
 */
function startStreamProcessor (processingGenerator) {
    // Instantiate the user-provided generator function to get an executable instance.
    const activeGeneratorInstance = processingGenerator();

    // A buffer (queue) to store parsed input tokens before they are fed to the generator.
    let inputTokenBuffer = [];
    // A flag to prevent re-entrant calls to the token processing loop, ensuring sequential execution.
    let isProcessingQueue = false;

    // Initially pause the standard input stream to prevent uncontrolled data flow
    // until we are ready to actively request more data.
    process.stdin.pause();

    /**
     * Callback function executed when new data arrives on `process.stdin`.
     * It's responsible for parsing the incoming chunk and queuing tokens.
     * @param {string} incomingChunk - The raw string data received from standard input.
     */
    const handleIncomingStreamData = (incomingChunk) => {
        // Basic validation for the incoming chunk. Skip if it's not a string or is empty.
        if (typeof incomingChunk !== 'string' || incomingChunk.trim().length === 0) {
            return; // Ignore invalid or empty data chunks.
        }

        // Temporarily pause the input stream to prevent new 'data' events
        // from firing while we are busy processing the current chunk.
        process.stdin.pause();

        // Split the incoming chunk into individual tokens using any sequence of whitespace
        // as a delimiter. The `filter(Boolean)` removes any empty strings that might result
        // from multiple spaces or leading/trailing whitespace.
        const parsedSegments = incomingChunk.split(/[\s\t\n\r]+/).filter(Boolean);

        // Add all valid parsed tokens to our internal buffer.
        inputTokenBuffer.push(...parsedSegments);

        // Attempt to process the tokens immediately after adding new ones.
        processBufferedTokens();
    };

    /**
     * The core loop for feeding tokens from the `inputTokenBuffer` to the generator.
     * This function continues until the buffer is empty or the generator yields
     * for more input or completes its execution.
     */
    const processBufferedTokens = () => {
        // If the processing loop is already active, do not re-enter to avoid race conditions.
        if (isProcessingQueue) {
            return;
        }
        isProcessingQueue = true; // Set flag to indicate processing is now active.

        // Continue processing as long as there are tokens in the buffer.
        while (inputTokenBuffer.length > 0) {
            // Retrieve the next token from the front of the queue using `shift()`.
            const nextInputToken = inputTokenBuffer.shift();

            // Advance the generator, passing the current token as its `yield` result.
            const generatorExecutionResult = activeGeneratorInstance.next(nextInputToken);

            // If the generator has yielded a non-null or non-undefined value, write it to stdout.
            if (generatorExecutionResult.value !== undefined && generatorExecutionResult.value !== null) {
                // Using cork/uncork can buffer writes for slight performance gains,
                // though for single writes it's often not strictly necessary.
                process.stdout.cork();
                process.stdout.write(String(generatorExecutionResult.value)); // Ensure output is a string.
                process.stdout.uncork();
            }

            // Check if the generator has indicated it's done (no more `yield`s or `return` was called).
            if (generatorExecutionResult.done) {
                isProcessingQueue = false; // Reset processing flag.
                // If the generator is done, we no longer need to listen for input data.
                process.stdin.removeListener('data', handleIncomingStreamData);
                return; // Exit the processing loop as the task is complete.
            }
        }

        // If the buffer is now empty, but the generator is not yet done,
        // it means we are waiting for more input. Resume `process.stdin`
        // to allow new data chunks to be received.
        isProcessingQueue = false; // Reset processing flag before resuming.
        process.stdin.resume();
    };

    // Register the `handleIncomingStreamData` function as the listener for 'data' events
    // on the standard input stream.
    process.stdin.on('data', handleIncomingStreamData);

    // Initiate the first round of token processing. This is important in case
    // the generator doesn't immediately yield, or if there's pre-buffered input.
    processBufferedTokens();
}