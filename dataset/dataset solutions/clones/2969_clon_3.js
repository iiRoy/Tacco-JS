const InputProcessor = (function() {
    /**
     * Factory function to create a new input reader instance.
     * @param {string} rawInputString - The complete raw input string.
     * @returns {StreamParser} An instance of the StreamParser.
     */
    function createInputReader(rawInputString) {
        return new StreamParser(rawInputString);
    }

    /**
     * Helper to convert a string value to a number.
     * In competitive programming contexts, we often assume valid numeric input.
     * @param {string} value - The string value to convert.
     * @returns {number} The numeric representation, or NaN if conversion fails.
     */
    const convertToNumeric = (value) => Number(value);

    /**
     * StreamParser class handles reading and parsing input data line by line.
     * It manages an internal pointer to the current line and tokenizes lines as needed.
     */
    class StreamParser {
        /**
         * Initializes the parser with the raw input content.
         * @param {string} inputContent - The full string content obtained from the input source.
         */
        constructor(inputContent) {
            // Split the input into individual lines. Handles both Windows (\r\n) and Unix (\n) line endings.
            // Each line is trimmed to remove leading/trailing whitespace, and empty lines are filtered out.
            this.inputLines = inputContent
                                    .split(/\r?\n/)
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0);
            this.currentLinePointer = 0; // Index of the current line being processed.
        }

        /**
         * Extracts the next single value from the input stream.
         * This method processes tokens from the current line. If the current line is exhausted,
         * it automatically advances to the next line. The line pointer (`currentLinePointer`)
         * is only incremented when a line has been completely consumed by this method.
         *
         * @param {boolean} [returnAsString=false] - If true, the value is returned as a string; otherwise, as a number.
         * @returns {string|number} The extracted value, or an empty string/NaN if no more input.
         */
        extractNumericValue(returnAsString = false) {
            // Check if there are any lines left to process.
            if (this.currentLinePointer >= this.inputLines.length) {
                return returnAsString ? "" : NaN;
            }

            let lineData = this.inputLines[this.currentLinePointer];

            // If the current line data is still a string, it means it hasn't been tokenized yet.
            if (typeof lineData === 'string') {
                // Split the line by one or more whitespace characters and filter out any empty tokens.
                // The array is then reversed to allow efficient `pop()` operations, mimicking the original logic.
                lineData = lineData.split(/\s+/).filter(Boolean).reverse();
                // If the line was empty or only contained whitespace, and thus yielded no tokens,
                // advance the pointer and recursively call to process the next line.
                if (lineData.length === 0) {
                    this.currentLinePointer++;
                    return this.extractNumericValue(returnAsString);
                }
                // Store the tokenized array back into `inputLines` to persist its state.
                this.inputLines[this.currentLinePointer] = lineData;
            }

            // Extract the last element (which was the first original token due to reversal).
            const extractedToken = lineData.pop();

            // If the current line (now an array of tokens) becomes empty after popping,
            // it means the line has been fully consumed, so advance to the next line.
            if (lineData.length === 0) {
                this.currentLinePointer++;
            }

            return returnAsString ? extractedToken : convertToNumeric(extractedToken);
        }

        /**
         * Reads the entire current line as an array of numbers or strings and then advances the line pointer.
         * If the line was partially consumed by `extractNumericValue`, its remaining parts are used.
         *
         * @param {boolean} [asStrings=false] - If true, returns parts as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of values from the line. Returns an empty array if no more lines.
         */
        fetchLineAsNumbers(asStrings = false) {
            if (this.currentLinePointer >= this.inputLines.length) {
                return [];
            }
            // Retrieve line content and immediately advance the line pointer.
            let lineContent = this.inputLines[this.currentLinePointer++];
            
            // If `lineContent` is an array, it means `extractNumericValue` has processed it.
            // We need to reverse it back to original order and join to simulate the full line.
            if (Array.isArray(lineContent)) {
                lineContent = lineContent.reverse().join(' ');
            }

            const parts = lineContent.split(/\s+/).filter(Boolean);
            return asStrings ? parts : parts.map(convertToNumeric);
        }

        /**
         * Parses a block of `count` lines as a matrix (2D array), advancing the line pointer by `count`.
         * Each line within the block is split into elements.
         *
         * @param {number} count - The number of lines to read for the matrix.
         * @param {boolean} [asStrings=false] - If true, matrix elements are strings; otherwise, numbers.
         * @returns {Array<Array<string|number>>} The parsed matrix. Returns an empty array if `count` is invalid.
         */
        parseMatrix(count, asStrings = false) {
            const matrixRows = [];
            if (count <= 0) return matrixRows;

            const startIndex = this.currentLinePointer;
            const endIndex = Math.min(startIndex + count, this.inputLines.length);

            for (let i = startIndex; i < endIndex; i++) {
                let lineContent = this.inputLines[i];
                // Handle cases where a line might have been partially consumed by `extractNumericValue`.
                if (Array.isArray(lineContent)) {
                    lineContent = lineContent.reverse().join(' ');
                }
                const rowParts = lineContent.split(/\s+/).filter(Boolean);
                matrixRows.push(asStrings ? rowParts : rowParts.map(convertToNumeric));
            }
            this.currentLinePointer = endIndex; // Update line index after processing the block.
            return matrixRows;
        }

        /**
         * Retrieves `count` raw lines without splitting them into parts, then advances the line pointer.
         * If a line was previously processed into an array of tokens by `extractNumericValue`, it is
         * reconstructed into a space-separated string.
         *
         * @param {number} count - The number of raw lines to retrieve.
         * @param {boolean} [asNumeric=false] - If true, attempts to convert each line (trimmed) to a number.
         * @returns {Array<string|number>} An array of raw lines. Returns an empty array if `count` is invalid.
         */
        retrieveRawLines(count, asNumeric = false) {
            if (count <= 0) return [];
            const start = this.currentLinePointer;
            const end = Math.min(this.currentLinePointer + count, this.inputLines.length);
            const rawSegment = this.inputLines.slice(start, end).map(line =>
                Array.isArray(line) ? line.reverse().join(' ') : line // Reconstruct if it was an array of tokens
            );
            this.currentLinePointer = end; // Advance the line pointer.
            return asNumeric ? rawSegment.map(convertToNumeric) : rawSegment;
        }
    }

    return createInputReader;
})();

// Initialize the input data reader by synchronously reading from standard input.
// Using `process.stdin.fd` is a more robust way to refer to standard input's file descriptor in Node.js.
const dataReader = InputProcessor(require("node:fs").readFileSync(process.stdin.fd, "utf8"));

// The `xArray` function from the original code has been removed.
// It was not utilized by the main logic and involved `eval`, which is generally discouraged
// due to security risks and potential performance issues. This deletion constitutes a Type III change.

// Output the result of the main sequence generation logic to the console.
console.log(generateGrayCodeSequence());

/**
 * Generates a specific sequence when the 'forbiddenValue' (k) is zero.
 * This sequence consists of numbers from 0 to (2^m - 1), where each number
 * appears twice in a pattern equivalent to `floor(i / 2)` for `i` from 0 to `2^(m+1) - 1`.
 *
 * Example: For `m=1`, `2^(1+1)=4` elements. `[0, 0, 1, 1]`.
 * For `m=2`, `2^(2+1)=8` elements. `[0, 0, 1, 1, 2, 2, 3, 3]`.
 *
 * @param {number} inputDimension - The 'm' value representing the number of bits.
 * @returns {string} The generated sequence as a space-separated string. Returns "-1" for invalid input.
 */
function generateSpecialSequence(inputDimension) {
    // Input validation: Ensure the dimension is non-negative, as negative bit shifts are undefined.
    if (inputDimension < 0) {
        console.error("Error: Input dimension for special sequence generation cannot be negative.");
        return "-1";
    }

    // The total length of this special sequence is 2 raised to the power of (inputDimension + 1).
    const sequenceLength = 1 << (inputDimension + 1);

    // Generate the array using `Array.from` for a declarative and functional approach.
    // Each element is `Math.floor(index / 2)`, which is equivalent to `index >> 1`.
    const resultingArray = Array.from({ length: sequenceLength }, (_, index) =>
        Math.floor(index / 2)
    );

    return resultingArray.join(" ");
}

/**
 * Main function to solve the problem by generating a modified Gray code-like sequence.
 * The sequence includes all numbers from 0 to (2^bitLength - 1),
 * with a specific 'forbiddenValue' inserted twice at defined points,
 * and the 'forbiddenValue' itself skipped in the main ascending/descending parts of the sequence.
 *
 * The problem is effectively asking for a sequence that traverses all numbers in
 * `[0, 2^m - 1]` (excluding `k`), then `k`, then `[2^m - 1, 0]` (excluding `k`), then `k`.
 *
 * @returns {string} The generated sequence as a space-separated string, or "-1" for invalid input conditions.
 */
function generateGrayCodeSequence() {
    // Read the two primary input values: `bitLength` (m) and `forbiddenValue` (k).
    const bitLength = dataReader.extractNumericValue();
    const forbiddenValue = dataReader.extractNumericValue();

    // --- Input Validation and Edge Case Handling ---

    // Guard clause: Ensure `bitLength` is non-negative. A negative bit length is illogical for bit shifts.
    if (bitLength < 0) {
        console.error("Invalid input: 'bitLength' cannot be negative.");
        return "-1";
    }

    // Calculate the maximum possible value in the range [0, 2^m - 1].
    const maxPossibleValue = (1 << bitLength);

    // Condition 1: If `forbiddenValue` is outside the valid range `[0, 2^m - 1]`.
    // The problem statement implies `k < 2^m`, so `k >= 2^m` or `k < 0` are invalid.
    if (forbiddenValue >= maxPossibleValue || forbiddenValue < 0) {
        return "-1";
    }

    // Condition 2: Special constraint for `bitLength = 1`. If `bitLength` is 1,
    // and `forbiddenValue` is not 0, it's an invalid scenario.
    // This is equivalent to `k && m === 1` from the original code but more explicit.
    if (bitLength === 1 && forbiddenValue !== 0) {
        return "-1";
    }

    // Condition 3: If `forbiddenValue` is 0, delegate to a specialized handler function.
    if (forbiddenValue === 0) {
        return generateSpecialSequence(bitLength);
    }

    // --- Core Sequence Generation Logic ---

    const outputSequence = []; // This array will store the final sequence elements.
    const highestValueInSet = maxPossibleValue - 1; // Represents (2^m - 1).

    // Part 1: Generate the ascending sequence from 0 to (2^m - 1), skipping the `forbiddenValue`.
    for (let currentNumber = 0; currentNumber <= highestValueInSet; ++currentNumber) {
        if (currentNumber !== forbiddenValue) {
            outputSequence.push(currentNumber);
        }
    }

    // Insert the `forbiddenValue` into the sequence after the ascending part.
    outputSequence.push(forbiddenValue);

    // Part 2: Generate the descending sequence from (2^m - 1) down to 0, again skipping the `forbiddenValue`.
    const descendingSegment = [];
    for (let currentNumber = highestValueInSet; currentNumber >= 0; --currentNumber) {
        if (currentNumber !== forbiddenValue) {
            descendingSegment.push(currentNumber);
        }
    }
    // Use the spread operator to efficiently add all elements of the `descendingSegment` to `outputSequence`.
    outputSequence.push(...descendingSegment);

    // Insert the `forbiddenValue` one last time at the very end of the sequence.
    outputSequence.push(forbiddenValue);

    // Join all elements of the `outputSequence` into a single space-separated string.
    return outputSequence.join(" ");
}