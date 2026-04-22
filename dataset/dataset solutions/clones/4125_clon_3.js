// A utility module for processing input text line by line.
const InputProcessor = (function() {
    /**
     * Represents a parser instance that efficiently reads tokens from a string buffer.
     * It manages an array of input lines and a pointer to the current line being processed.
     */
    class DataStreamParser {
        #sourceLines;   // Private field to store the input lines, initially strings, then arrays of tokens.
        #linePointer;   // Private field for the current line index being read.

        /**
         * Constructs a new DataStreamParser instance.
         * @param {string} rawInputText - The entire input provided as a single string.
         */
        constructor(rawInputText) {
            // Trim leading/trailing whitespace from the raw input and split it into an array of individual lines.
            this.#sourceLines = rawInputText.trim().split("\n");
            // Initialize the line pointer to indicate the first line (index 0) of the input.
            this.#linePointer = 0;
        }

        /**
         * Reads and extracts the next single token from the current line.
         * This method processes tokens from left to right by internally reversing the line's token array
         * and then using `pop()`. If the current line is exhausted, it advances to the next line.
         * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
         * @returns {string|number} The extracted token value.
         */
        extractNextToken(returnAsString = false) {
            // Get the data for the current line. It might be a string or an array of tokens.
            let currentLineReference = this.#sourceLines[this.#linePointer];

            // If the current line data is still a string, it means it hasn't been split into tokens yet.
            if (typeof currentLineReference === "string") {
                // Split the line by spaces, then reverse the resulting array.
                // Reversing allows us to use `pop()` to get elements from the original "front" of the line,
                // which is generally more performant than `shift()`.
                currentLineReference = currentLineReference.split(" ").reverse();
                // Update the sourceLines array at the current pointer with the tokenized array.
                this.#sourceLines[this.#linePointer] = currentLineReference;
            }

            // Extract the last element from the (reversed) token array.
            const tokenValue = currentLineReference.pop();

            // If the current line's token array is now empty, it means all tokens on this line have been consumed.
            // Advance the line pointer to the next line for subsequent reads.
            if (currentLineReference.length === 0) {
                this.#linePointer++;
            }

            // Return the token, converting it to a number unless `returnAsString` is explicitly true.
            return returnAsString ? tokenValue : Number(tokenValue);
        }

        /**
         * Reads an entire line, splits it into individual tokens, and then advances the line pointer.
         * @param {boolean} [keepAsStrings=false] - If true, the tokens are returned as strings; otherwise, they are converted to numbers.
         * @returns {Array<string|number>} An array containing all tokens from the read line.
         */
        fetchLineTokens(keepAsStrings = false) {
            // Basic guard: If the line pointer has gone beyond the available lines, return an empty array.
            if (this.#linePointer >= this.#sourceLines.length) {
                console.warn("Attempted to read past end of input stream.");
                return [];
            }

            // Get the content of the current line and immediately advance the line pointer.
            const lineContent = this.#sourceLines[this.#linePointer++];
            // Split the line into tokens based on spaces.
            const tokens = lineContent.split(" ");

            // If `keepAsStrings` is true, return the tokens as they are (strings).
            // Otherwise, map each token to its numerical representation.
            return keepAsStrings ? tokens : tokens.map(str => Number(str));
        }

        /**
         * Reads a specified number of consecutive lines, treating each line as a row of tokens,
         * and returns them as a 2D array (matrix).
         * @param {number} rowCount - The number of lines (rows) to read for the matrix.
         * @param {boolean} [preserveTypes=false] - If true, tokens remain strings; otherwise, they are converted to numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix of tokens.
         */
        readInputMatrix(rowCount, preserveTypes = false) {
            // Input validation: Ensure `rowCount` is positive and does not exceed available lines.
            if (rowCount <= 0 || this.#linePointer + rowCount > this.#sourceLines.length) {
                console.warn(`Invalid rowCount (${rowCount}) or insufficient lines remaining.`);
                return [];
            }

            // Slice the relevant lines from the source array.
            // For each line, split it into tokens.
            const matrixRows = this.#sourceLines
                .slice(this.#linePointer, this.#linePointer + rowCount)
                .map(line => line.split(" "));

            // Advance the line pointer by the number of rows read.
            this.#linePointer += rowCount;

            // If `preserveTypes` is true, return the matrix as is.
            // Otherwise, iterate through each row and each token to convert them to numbers.
            return preserveTypes ? matrixRows : matrixRows.map(row => row.map(str => Number(str)));
        }

        /**
         * Reads a specified number of lines directly, without splitting them into tokens,
         * returning each line as a single item in an array.
         * @param {number} count - The number of lines to read.
         * @param {boolean} [asRawStrings=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
         * @returns {Array<string|number>} An array where each element is a full line (either string or number).
         */
        getMultipleLines(count, asRawStrings = false) {
            // Input validation: Ensure `count` is positive and does not exceed available lines.
            if (count <= 0 || this.#linePointer + count > this.#sourceLines.length) {
                console.warn(`Invalid count (${count}) or insufficient lines remaining.`);
                return [];
            }

            // Collect the specified number of lines directly from the source array.
            const collectedLines = this.#sourceLines.slice(this.#linePointer, this.#linePointer + count);
            // Advance the line pointer by the number of lines collected.
            this.#linePointer += count;

            // If `asRawStrings` is true, return the collected lines as strings.
            // Otherwise, attempt to convert each collected line to a number.
            return asRawStrings ? collectedLines : collectedLines.map(line => Number(line));
        }
    }

    // The factory function that creates and returns new instances of the DataStreamParser.
    return function createInputParser(inputString) {
        return new DataStreamParser(inputString);
    };
})();

// Instantiate the input parser by reading content from standard input (`/dev/stdin`).
// The `require("fs").readFileSync` method is used for synchronous file reading.
const dataReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary problem-solving function and print its return value to the console.
console.log(solveProblem());

/**
 * Main function to solve the problem: counting specific prime pairs within given ranges.
 * The problem defines a "valid prime pair" as a number `p` such that `p` is prime
 * AND `(p+1)/2` is also prime.
 * This function first pre-computes counts of such pairs up to a maximum limit using a sieve,
 * and then processes multiple range queries [L, R] to report the counts.
 * @returns {string} The final answer string, with each query result separated by a newline character.
 */
function solveProblem() {
    // Read the total number of queries from the first line of input using the dataReader.
    const numberOfQueries = dataReader.extractNextToken();

    // Define the upper boundary for prime number calculations.
    // This constant improves readability and makes the limit easily modifiable.
    const MAX_PRIME_LIMIT = 100000;

    // `isPrimeFlag`: A boolean array used for the Sieve of Eratosthenes.
    // `isPrimeFlag[i]` will be true if `i` is potentially prime, false otherwise.
    // Array is sized `MAX_PRIME_LIMIT + 1` to accommodate indices from 0 up to `MAX_PRIME_LIMIT`.
    const isPrimeFlag = new Array(MAX_PRIME_LIMIT + 1).fill(true);

    // `cumulativeCounts`: An array to store prefix sums of "valid prime pairs".
    // `cumulativeCounts[i]` will hold the total count of valid prime pairs found up to `i` (inclusive).
    const cumulativeCounts = new Array(MAX_PRIME_LIMIT + 1).fill(0);

    // Initialize the sieve: 0 and 1 are not considered prime numbers.
    isPrimeFlag[0] = false;
    isPrimeFlag[1] = false;

    // Implement the Sieve of Eratosthenes to populate `isPrimeFlag`
    // and simultaneously calculate `cumulativeCounts`.
    for (let currentNum = 2; currentNum <= MAX_PRIME_LIMIT; currentNum++) {
        // By default, carry over the count from the previous number.
        // This value will be incremented later if `currentNum` itself forms a valid prime pair.
        cumulativeCounts[currentNum] = cumulativeCounts[currentNum - 1];

        // Check if `currentNum` is currently marked as prime.
        if (isPrimeFlag[currentNum]) {
            // If `currentNum` is prime, mark all its multiples as not prime.
            // Start marking from `currentNum * 2` (or `currentNum + currentNum`) to avoid marking `currentNum` itself.
            for (let multiple = currentNum * 2; multiple <= MAX_PRIME_LIMIT; multiple += currentNum) {
                isPrimeFlag[multiple] = false;
            }

            // Now, evaluate the condition for a "valid prime pair":
            // `currentNum` must be prime (which we just confirmed) AND `(currentNum + 1) / 2` must also be prime.
            // Since `currentNum` is a prime greater than 2, it must be an odd number.
            // Therefore, `currentNum + 1` will always be an even number, ensuring `(currentNum + 1) / 2` is an integer.
            const candidateHalfValue = (currentNum + 1) / 2;

            // Check if `candidateHalfValue` is within our calculated range and is also marked as prime.
            if (candidateHalfValue <= MAX_PRIME_LIMIT && isPrimeFlag[candidateHalfValue]) {
                // If both conditions are met, increment the cumulative count for `currentNum`.
                cumulativeCounts[currentNum]++;
            }
        }
    }

    // An array to store the computed results for each individual query.
    const queryResults = [];

    // Process each of the `numberOfQueries`.
    for (let qIndex = 0; qIndex < numberOfQueries; qIndex++) {
        // Each query consists of two numbers representing a range: a lower bound (L) and an upper bound (R).
        const [lowerBound, upperBound] = dataReader.fetchLineTokens();

        // Calculate the count of valid prime pairs within the range [lowerBound, upperBound].
        // This is efficiently done using prefix sums: `cumulativeCounts[R] - cumulativeCounts[L-1]`.
        // The `lowerBound - 1` ensures we correctly exclude counts up to `L-1`.
        const countInCurrentRange = cumulativeCounts[upperBound] - cumulativeCounts[lowerBound - 1];
        // Add the calculated count to our results array.
        queryResults.push(countInCurrentRange);
    }

    // Join all the collected query results with newline characters to form the final output string.
    return queryResults.join("\n");
}