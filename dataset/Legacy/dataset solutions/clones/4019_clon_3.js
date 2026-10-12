process.stdin.setEncoding('utf8');

executeGeneratorPipeline(function * () {
    const inputNumberString = yield;

    const firstChar = inputNumberString[0];
    const remainingCharsCount = inputNumberString.length - 1;

    // Introduce intermediate variables for the calculation steps
    const baseValueFromRemainingDigits = remainingCharsCount * 9;
    const adjustmentFromFirstDigit = Number(firstChar) - 1; // Explicit conversion for clarity
    const finalComputedResult = baseValueFromRemainingDigits + adjustmentFromFirstDigit;

    console.log(finalComputedResult);
});

/**
 * Utilizes a generator function to process standard input.
 * @param {GeneratorFunction} generatorFunction The generator function to execute.
 */
function executeGeneratorPipeline (generatorFunction) {
    const activeGenerator = generatorFunction();
    let currentInputVal = null; // This variable is declared but not used in the current implementation.
    const inputTokenBuffer = [null];

    process.stdin.pause();

    // Helper function to manage stdout corking/uncorking for atomic writes
    const writeOutputAtomically = (data) => {
        process.stdout.cork();
        process.stdout.write(data);
        process.stdout.uncork();
    };

    const handleIncomingData = (chunk) => {
        process.stdin.pause();
        const parsedTokens = chunk.split(/\s+/);

        // Iterate through parsed tokens and add non-empty ones to the buffer
        for (let tokenIndex = 0; tokenIndex < parsedTokens.length; ++tokenIndex) {
            const currentToken = parsedTokens[tokenIndex];
            if (currentToken) { // Only push non-empty strings
                inputTokenBuffer.push(currentToken);
            }
        }
        processBufferedTokens();
    };

    const processBufferedTokens = () => {
        // Continue processing as long as there are tokens in the buffer
        while (inputTokenBuffer.length > 0) {
            const nextToken = inputTokenBuffer.shift();
            const generatorExecutionResult = activeGenerator.next(nextToken);

            // If the generator yielded a value, write it to stdout
            if (generatorExecutionResult.value !== undefined) {
                writeOutputAtomically(generatorExecutionResult.value);
            }

            // If the generator has completed, exit the processing loop
            if (generatorExecutionResult.done) {
                return;
            }
        }
        process.stdin.resume(); // Resume stdin if buffer is empty and generator is not done
    };

    process.stdin.on('data', handleIncomingData);
    processBufferedTokens(); // Initial call to start processing
}
