class DataStreamProcessor {
    #sourceLines;
    #currentLineIndex = 0;
    #currentTokenIndex = 0;
    #valueTransformFn;

    /**
     * Constructs a new DataStreamProcessor instance to parse input data.
     * @param {string} rawInputString - The entire input content as a single string.
     * @param {Function} [transformer=Number] - An optional function to transform parsed tokens (e.g., Number, String).
     */
    constructor(rawInputString, transformer = Number) {
        // Validate input string
        if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
            // In a real application, this might throw an error or log a warning.
            // For clone generation, we'll initialize safely.
            this.#sourceLines = [];
            console.error("Input string for DataStreamProcessor is invalid or empty.");
        } else {
            this.#sourceLines = rawInputString.split("\n");
        }

        // Ensure the transformer is a callable function, default to Number
        this.#valueTransformFn = typeof transformer === 'function' ? transformer : Number;
    }

    /**
     * Retrieves the next individual token from the input stream.
     * Advances the internal line and token pointers.
     * Skips empty lines automatically.
     * @returns {*} The transformed token value, or undefined if no more tokens are available.
     */
    retrieveNextToken() {
        // Loop to find the next non-empty line with tokens
        while (this.#currentLineIndex < this.#sourceLines.length) {
            const currentLineContent = this.#sourceLines[this.#currentLineIndex];

            // If the line is undefined (shouldn't happen with split), or just whitespace, skip it.
            if (currentLineContent === undefined || currentLineContent.trim() === "") {
                this.#currentLineIndex++;
                this.#currentTokenIndex = 0; // Reset token index for the new line
                continue; // Try the next line
            }

            // Split the current line into tokens, using one or more whitespace characters as delimiters
            const tokensOnCurrentLine = currentLineContent.trim().split(/\s+/);

            // If there are tokens left on the current line
            if (this.#currentTokenIndex < tokensOnCurrentLine.length) {
                const rawToken = tokensOnCurrentLine[this.#currentTokenIndex];
                this.#currentTokenIndex++; // Advance token pointer

                // If all tokens on this line are now consumed, prepare for the next line
                if (this.#currentTokenIndex >= tokensOnCurrentLine.length) {
                    this.#currentTokenIndex = 0;
                    this.#currentLineIndex++;
                }
                return this.#valueTransformFn(rawToken); // Transform and return the token
            } else {
                // All tokens on this line were consumed, move to the next line
                this.#currentTokenIndex = 0;
                this.#currentLineIndex++;
            }
        }
        // If we reach here, all lines and tokens have been processed
        return undefined;
    }
}

/**
 * Helper function to compute all positive divisors of a given number.
 * Uses a Set to efficiently handle duplicates (e.g., for perfect squares).
 * @param {number} numToFactor - The integer for which to find divisors.
 * @returns {number[]} An array of unique positive divisors, sorted in ascending order.
 */
const computeAllDivisors = (numToFactor) => {
    // Guard clause: Divisors are typically for positive integers.
    if (numToFactor <= 0 || !Number.isInteger(numToFactor)) {
        return [];
    }

    const foundFactors = new Set();
    const sqrtLimit = Math.sqrt(numToFactor);

    // Iterate up to the square root to find factor pairs
    for (let currentCandidate = 1; currentCandidate <= sqrtLimit; currentCandidate++) {
        if (numToFactor % currentCandidate === 0) {
            foundFactors.add(currentCandidate); // Add the smaller factor
            foundFactors.add(numToFactor / currentCandidate); // Add the complementary larger factor
        }
    }

    // Convert the Set to an Array and sort numerically for consistent output.
    const sortedFactors = Array.from(foundFactors).sort((a, b) => a - b);
    return sortedFactors;
};

/**
 * Main function to solve the problem: find the largest divisor 'd' of 'M'
 * such that 'M/d' is greater than or equal to 'N'.
 * @param {string} problemInput - The raw input string containing the values for N and M.
 */
function processProblemSolution(problemInput) {
    const inputHandler = new DataStreamProcessor(problemInput);

    // Read the two required numerical parameters from the input stream
    const requiredCountN = inputHandler.retrieveNextToken(); // Represents N in the original problem
    const totalValueM = inputHandler.retrieveNextToken();    // Represents M in the original problem

    // Validate the parsed input values
    if (requiredCountN === undefined || totalValueM === undefined ||
        isNaN(requiredCountN) || isNaN(totalValueM) ||
        requiredCountN <= 0 || totalValueM <= 0 ||
        !Number.isInteger(requiredCountN) || !Number.isInteger(totalValueM))
    {
        console.error("Error: Problem parameters N and M must be positive integers.");
        return; // Abort processing if input is invalid
    }

    // Calculate all positive divisors for the totalValueM
    const allPossibleFactors = computeAllDivisors(totalValueM);

    let largestApplicableFactor = 1; // Initialize with the smallest possible factor (1 is always a divisor)

    // Iterate through the sorted factors to find the largest one that meets the condition.
    // The condition (M / d >= N) can be rewritten as (d <= M / N).
    // Since factors are sorted ascending, we can stop early if a factor becomes too large.
    const thresholdForFactor = totalValueM / requiredCountN;

    for (const currentFactor of allPossibleFactors) {
        if (currentFactor <= thresholdForFactor) {
            largestApplicableFactor = currentFactor;
        } else {
            // Optimization: Since the factors are sorted, if the current factor
            // exceeds the threshold, all subsequent factors will also exceed it.
            // Therefore, we can break the loop early.
            break;
        }
    }

    // Output the final computed result to standard output.
    console.log(largestApplicableFactor);
}

// Execute the problem solution by reading input from standard input.
processProblemSolution(require("fs").readFileSync("/dev/stdin", "utf8"));