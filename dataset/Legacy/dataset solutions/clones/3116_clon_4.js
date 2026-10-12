const fileSystem = require('fs');

/**
 * Asynchronously reads the entire content from /dev/stdin.
 * @returns {Promise<string>} A promise that resolves with the content of stdin as a string, or rejects with an error.
 */
function obtainInputContent() {
    return new Promise((resolve, reject) => {
        fileSystem.readFile("/dev/stdin", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Creates a function that, when called, returns the next non-whitespace token from the provided string.
 * This acts as a stateful tokenizer, similar to a generator but implemented with a closure.
 * @param {string} sourceString The string to tokenize.
 * @returns {function(): (string|undefined)} A function that returns the next token or undefined if no more tokens.
 */
function createTokenStream(sourceString) {
    let currentOffset = 0;
    let tokenBegin = -1;

    // Helper to determine if a character is a whitespace separator or end of string
    const isSeparator = (char) => char === ' ' || char === '\n' || char === '\t' || char === '\r' || char === undefined;

    return function fetchNextToken() {
        while (currentOffset <= sourceString.length) {
            const char = sourceString[currentOffset];
            const isCurrentOffsetSeparator = isSeparator(char);

            if (isCurrentOffsetSeparator) {
                if (tokenBegin !== -1) {
                    // A word just ended, extract it
                    const extractedToken = sourceString.substring(tokenBegin, currentOffset);
                    tokenBegin = -1; // Reset for the next word
                    currentOffset++; // Advance past the separator
                    return extractedToken;
                }
            } else { // Not a separator
                if (tokenBegin === -1) {
                    // Mark the beginning of a new word
                    tokenBegin = currentOffset;
                }
            }
            currentOffset++;
        }
        return undefined; // No more tokens left in the string
    };
}

/**
 * Asynchronously prepares a function to fetch and parse the next integer from stdin.
 * @returns {Promise<function(): number>} A promise that resolves with a function which, when called,
 *                                        returns the next integer from the input stream.
 */
async function acquireIntegerFetcher() {
    const rawInput = await obtainInputContent();
    const tokenGetter = createTokenStream(rawInput);

    return function getNextParsedInteger() {
        const token = tokenGetter();
        return token !== undefined ? parseInt(token, 10) : NaN;
    };
}

// Main execution block
(async () => {
    const retrieveNextInteger = await acquireIntegerFetcher();
    const upperLimit = retrieveNextInteger();

    // Determine the sum value to exclude based on upperLimit's parity
    const exclusionValue = (upperLimit % 2 === 1) ? upperLimit : upperLimit + 1;

    // Generate numbers from 1 to upperLimit and iterate through them
    Array.from({ length: upperLimit }, (_, idx1) => idx1 + 1)
        .forEach(val1 => {
            // For each val1, generate numbers from val1 + 1 to upperLimit
            Array.from({ length: upperLimit - val1 }, (_, idx2) => val1 + 1 + idx2)
                // Filter out pairs whose sum matches the exclusionValue
                .filter(val2 => val1 + val2 !== exclusionValue)
                // Log the remaining valid pairs
                .forEach(val2 => {
                    console.log(`${val1} ${val2}`);
                });
        });
})();
