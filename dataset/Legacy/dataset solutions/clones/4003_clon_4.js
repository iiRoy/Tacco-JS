const os = require('os');
const readline = require('readline');

/**
 * Orchestrates input/output for a given asynchronous main logic function.
 * This function replaces the original's generator-based `run` function
 * with an async/await and readline-based approach for input processing.
 *
 * @param {(outputWriter: (line: string, end?: string) => void, inputFetcher: () => Promise<string|null>) => Promise<any>} mainLogic
 */
async function processInputOutput(mainLogic) {
    const inputReader = readline.createInterface({
        input: process.stdin,
        output: process.stdout, // Required by readline, but not used for actual output here
        crlfDelay: Infinity // Ensures correct line ending handling
    });

    let currentLineTokens = [];
    const lineAsyncIterator = inputReader[Symbol.asyncIterator]();

    /**
     * Asynchronously fetches the next input token (word).
     * This replaces the original's `gets` generator.
     * It handles buffering words from lines and skipping empty lines.
     * @returns {Promise<string|null>} The next word, or null if end of input.
     */
    async function fetchNextInputToken() {
        if (currentLineTokens.length > 0) {
            return currentLineTokens.shift();
        }

        const nextLineResult = await lineAsyncIterator.next();

        if (nextLineResult.done) {
            return null; // End of input stream
        }

        const lineContent = nextLineResult.value;
        // Extract all non-whitespace sequences from the line.
        // This mimics the original's word extraction logic.
        const extractedTokens = lineContent.match(/[^\s]+/g);

        if (extractedTokens && extractedTokens.length > 0) {
            currentLineTokens = extractedTokens;
            return currentLineTokens.shift();
        } else {
            // If the line was empty or only contained whitespace,
            // recursively try to fetch from the next line immediately.
            return await fetchNextInputToken();
        }
    }

    /**
     * Writes a line to standard output.
     * This function is equivalent to the original's `write` function.
     * @param {string} text The string to write.
     * @param {string} [terminator] The string to append after `text`. Defaults to `os.EOL`.
     */
    function outputLine(text, terminator) {
        process.stdout.cork();
        process.stdout.write(text + (terminator === undefined ? os.EOL : terminator));
        process.stdout.uncork();
    }

    try {
        // Execute the user's main logic, passing the new I/O functions.
        await mainLogic(outputLine, fetchNextInputToken);
    } finally {
        // Ensure the readline interface is closed to release resources.
        inputReader.close();
    }
}

// The user's main logic, adapted to be an async function
// and use `await` for input fetching.
processInputOutput(async function (outputWriter, inputFetcher) {
    // Fetch the first input token (expected to be a number string).
    let inputString = await inputFetcher();

    // Parse the string to an integer.
    let numericValue = Number.parseInt(inputString, 10);

    // Calculate the floor of the number divided by 3.
    let result = Math.floor(numericValue / 3);

    // Write the result to output.
    outputWriter(result);
});
