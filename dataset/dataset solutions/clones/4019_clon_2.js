process.stdin.setEncoding('utf8'); // Configure standard input to use UTF-8 encoding.

executeProcess(function * () { // Initiate the primary execution flow using a generator function.
    let inputDigits = yield; // Pause execution and wait for the next input token, assigning it to 'inputDigits'.

    const initialDigit = inputDigits[0]; // Extract the first character (digit) from the input.
    const remainingDigitsCount = inputDigits.length - 1; // Calculate the count of digits following the first one.
    console.log(remainingDigitsCount * 9 + (initialDigit - 1)); // Compute and display the final result.
});

/**
 * Manages standard input for a generator function, allowing it to 'yield' for input.
 * @param {GeneratorFunction} primaryTask The generator function that will consume input tokens.
 */
function executeProcess (primaryTask) {
    const taskGenerator = primaryTask(); // Create an instance of the generator.
    let inputBuffer = null; // A placeholder variable, not actively used in this specific logic.
    const tokenQueue = [null]; // A queue to store incoming input tokens, initialized with a null entry.

    process.stdin.pause(); // Initially pause the standard input stream to control data flow.

    function processInputChunk (dataBlock) {
        // Pause standard input again to ensure no new data arrives while processing the current block.
        process.stdin.pause();
        // Split the received data block into individual tokens using whitespace as a delimiter.
        const parsedTokens = dataBlock.split(/\s+/);
        for (let idx = 0, tokenCount = parsedTokens.length; idx < tokenCount; ++idx) {
            if (parsedTokens[idx]) { // Only add non-empty tokens to our processing queue.
                tokenQueue.push(parsedTokens[idx]);
            }
        }
        processTokensLoop(); // After adding new tokens, resume the main processing loop.
    }

    function processTokensLoop () {
        while (tokenQueue.length > 0) { // Continue as long as there are tokens waiting in the queue.
            const generatorResult = taskGenerator.next(tokenQueue.shift()); // Pass the next token to the generator and get its result.
            if (generatorResult.value !== undefined) { // If the generator yielded a value (i.e., requested output).
                // Buffer and write the yielded value to standard output.
                process.stdout.cork(); // Start buffering output.
                process.stdout.write(generatorResult.value); // Write the value.
                process.stdout.uncork(); // Flush the buffered output.
            }
            // If the generator has indicated it's done (returned), terminate this processing function.
            if (generatorResult.done) return;
        }

        process.stdin.resume(); // If the token queue is empty, resume standard input to receive more data.
    }

    process.stdin.on('data', processInputChunk); // Register the 'processInputChunk' function to handle incoming 'data' events from stdin.

    processTokensLoop(); // Begin the initial token processing loop to kickstart the generator.
}
