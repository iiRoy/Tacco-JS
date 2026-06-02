var DATA_PARSER = (function() {
    /**
     * Factory function to create an InputProcessor instance.
     * @param {string} rawInputString - The raw input string from stdin.
     * @returns {InputProcessor} A new InputProcessor object.
     */
    function createParser(rawInputString) {
        return new InputProcessor(rawInputString);
    }

    /**
     * InputProcessor class to handle parsing lines and tokens from input.
     * @param {string} inputStr - The string content to parse.
     */
    function InputProcessor(inputStr) {
        // Store input lines, trimmed and split by newline
        this._sourceLines = inputStr.trim().split("\n");
        // Current line index for reading
        this._currentLineIndex = 0;
    }

    /**
     * Reads a single token from the current line.
     * If the line is exhausted, moves to the next.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The parsed token.
     */
    InputProcessor.prototype.readToken = function(asString) {
        let currentLineContent = this._sourceLines;
        let linePointer = this._currentLineIndex;
        let extractedToken;

        // If the current line hasn't been split into tokens yet, do so.
        // Tokens are stored in reverse order for efficient popping.
        if (typeof currentLineContent[linePointer] === "string") {
            currentLineContent[linePointer] = currentLineContent[linePointer].split(" ").reverse();
        }

        // Pop the last token (which was originally the first)
        extractedToken = currentLineContent[linePointer].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLineContent[linePointer].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number
        return asString ? extractedToken : +extractedToken;
    };

    /**
     * Reads all tokens from the current line.
     * Advances the line pointer.
     * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputProcessor.prototype.readLineTokens = function(asStrings) {
        // Get the current line, split by space, and advance the line pointer.
        let tokensOnLine = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return as strings or map to numbers
        return asStrings ? tokensOnLine : tokensOnLine.map(val => +val);
    };

    /**
     * Reads 'numLines' lines as a matrix of tokens.
     * Advances the line pointer by 'numLines'.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    InputProcessor.prototype.readMatrix = function(numLines, asStrings) {
        // Slice the required number of lines and split each into tokens.
        let matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                        .map(line => line.split(" "));
        // Return as strings or map all elements to numbers
        return asStrings ? matrixData : matrixData.map(row => row.map(element => +element));
    };

    /**
     * Reads 'numLines' lines as an array of single values.
     * Advances the line pointer by 'numLines'.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values.
     */
    InputProcessor.prototype.readLines = function(numLines, asStrings) {
        // Slice the required number of lines.
        let lineValues = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return as strings or map to numbers
        return asStrings ? lineValues : lineValues.map(val => +val);
    };

    return createParser; // The factory function is returned.
})();

// Initialize the input reader with content from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving logic and print its result to console.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It calculates prime numbers and a specific count based on them,
 * then processes queries.
 * @returns {string} The final results joined by newlines.
 */
function solveProblem() {
    // Read the number of queries from input.
    let queryCount = inputReader.readToken();

    // Initialize an array for Sieve of Eratosthenes up to 10^5.
    // `isPrime[k]` will be 1 if k is potentially prime, 0 otherwise.
    let isPrime = Array(100000 + 1).fill(1);
    // `primeCountPrefixSum[k]` will store the count of "similar" primes up to k.
    let primeCountPrefixSum = [0, 0]; // Initialize for 0 and 1

    // 0 and 1 are not prime.
    isPrime[0] = isPrime[1] = 0;

    // Sieve of Eratosthenes to find primes up to 10^5.
    // Also, calculate the prefix sum for "similar" primes.
    for (let idx = 2; idx <= 100000; idx++) {
        if (isPrime[idx]) { // If idx is prime
            // Mark all multiples of idx as not prime.
            for (let multipleIdx = idx + idx; multipleIdx <= 100000; multipleIdx += idx) {
                isPrime[multipleIdx] = 0;
            }
            // Check if (idx+1)/2 is also prime.
            // This is the condition for "similar" primes.
            if (isPrime[(idx + 1) / 2]) {
                primeCountPrefixSum[idx] = primeCountPrefixSum[idx - 1] + 1;
            } else {
                primeCountPrefixSum[idx] = primeCountPrefixSum[idx - 1];
            }
        } else { // If idx is not prime, just carry over the previous count.
            primeCountPrefixSum[idx] = primeCountPrefixSum[idx - 1];
        }
    }

    // Array to store the results for each query.
    let results = [];

    // Process each query.
    for (let idx = 0; idx < queryCount; idx++) {
        // Read the query range [L, R].
        let queryRange = inputReader.readLineTokens(); // queryRange[0] is L, queryRange[1] is R
        // Calculate the count of "similar" primes in the range [L, R].
        // This is done using prefix sums: count(R) - count(L-1).
        results[idx] = primeCountPrefixSum[queryRange[1]] - primeCountPrefixSum[queryRange[0] - 1];
    }

    // Join all results with newline characters and return the final string.
    return results.join("\n");
}
