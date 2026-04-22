var createInputReader = (function () {
    // Private helper for numeric conversion, ensures consistency
    function convertToNumber(value) {
        if (typeof value === 'string') {
            return Number(value);
        }
        return value; // Already a number or other type
    }

    // Factory function to initialize the InputDataProcessor
    function instantiateReader(sourceTextContent) {
        return new InputDataProcessor(sourceTextContent);
    }

    // The core class for processing input data line by line
    function InputDataProcessor(rawInputString) {
        // Store all input lines, filtering out empty ones and handling different newline styles.
        this.allInputLines = rawInputString.split(/\r?\n/).filter(line => line.trim().length > 0);
        // Pointer to the current line being processed
        this.currentLinePointer = 0;
        // Cache to store tokenized and reversed lines for efficient single value extraction
        // using getNextValue. Null indicates the line has not been processed for token extraction yet.
        this.lineTokenCache = new Array(this.allInputLines.length).fill(null);
    }

    // Helper method to prepare a line for token extraction (splitting and reversing if needed)
    // This is called by getNextValue to optimize popping tokens from the end of a line.
    InputDataProcessor.prototype._prepareLineForTokenExtraction = function () {
        const lineIndex = this.currentLinePointer;
        if (lineIndex >= this.allInputLines.length) {
            throw new Error("Input data exhausted: Attempted to prepare a line beyond the end of the input.");
        }
        // If the line hasn't been split and reversed for token extraction yet, do it now.
        if (this.lineTokenCache[lineIndex] === null) {
            this.lineTokenCache[lineIndex] = this.allInputLines[lineIndex].split(' ').reverse();
        }
        return this.lineTokenCache[lineIndex];
    };

    /**
     * Extracts a single value (token) from the end of the current line.
     * The line is processed (split and reversed) only once when this method is first called for it.
     * Subsequent calls for the same line will pop from the already prepared token array.
     *
     * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted value.
     */
    InputDataProcessor.prototype.getNextValue = function (returnAsString = false) {
        // Ensure we haven't run out of lines
        if (this.currentLinePointer >= this.allInputLines.length) {
            throw new Error("Input data exhausted: No more single values to read.");
        }

        const currentTokens = this._prepareLineForTokenExtraction();
        const extractedToken = currentTokens.pop(); // Remove and return the last token

        // If the current line is now empty of tokens, advance to the next line and clear its cache entry.
        if (currentTokens.length === 0) {
            this.lineTokenCache[this.currentLinePointer] = null; // Clear cache for the consumed line
            this.currentLinePointer++;
        }

        return returnAsString ? extractedToken : convertToNumber(extractedToken);
    };

    /**
     * Reads and processes the entire current line, splitting it into tokens.
     * Advances the line pointer.
     *
     * @param {boolean} [returnAsStrings=false] If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputDataProcessor.prototype.readCurrentLineTokens = function (returnAsStrings = false) {
        if (this.currentLinePointer >= this.allInputLines.length) {
            throw new Error("Input data exhausted: No more lines to read for tokens.");
        }

        const lineContent = this.allInputLines[this.currentLinePointer];
        this.currentLinePointer++; // Advance line pointer immediately after reading

        const tokens = lineContent.split(' ');
        return returnAsStrings ? tokens : tokens.map(convertToNumber);
    };

    /**
     * Reads a specified number of lines and processes each into an array of tokens, forming a matrix.
     * Advances the line pointer by `numberOfRows`.
     *
     * @param {number} numberOfRows The number of lines to read.
     * @param {boolean} [returnAsStrings=false] If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    InputDataProcessor.prototype.readMultiLineMatrix = function (numberOfRows, returnAsStrings = false) {
        if (numberOfRows <= 0) {
            throw new Error("Invalid argument: numberOfRows must be a positive integer.");
        }
        if (this.currentLinePointer + numberOfRows > this.allInputLines.length) {
            throw new Error(`Input data exhausted: Cannot read ${numberOfRows} lines for matrix.`);
        }

        const matrixData = [];
        for (let i = 0; i < numberOfRows; i++) {
            // Reusing readCurrentLineTokens for consistency and efficiency
            matrixData.push(this.readCurrentLineTokens(returnAsStrings));
        }
        return matrixData;
    };

    /**
     * Reads a specified number of lines directly as raw strings or converted numbers.
     * Does not split lines into tokens, just retrieves the full line content.
     * Advances the line pointer by `count`.
     *
     * @param {number} count The number of raw lines to retrieve.
     * @param {boolean} [convertToNumber=false] If true, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw line contents.
     */
    InputDataProcessor.prototype.retrieveLinesAsStrings = function (count, convertToNumber = false) {
        if (count <= 0) {
            throw new Error("Invalid argument: count must be a positive integer.");
        }
        if (this.currentLinePointer + count > this.allInputLines.length) {
            throw new Error(`Input data exhausted: Cannot retrieve ${count} raw lines.`);
        }

        const rawLines = this.allInputLines.slice(this.currentLinePointer, this.currentLinePointer + count);
        this.currentLinePointer += count; // Advance line pointer

        return convertToNumber ? rawLines.map(convertToNumber) : rawLines;
    };

    return instantiateReader; // The factory function is returned
})();

// Instantiate the input reader by reading from standard input
var dataInputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the problem-solving function
console.log(executeProblemSolver());

/**
 * Solves a specific problem involving range manipulation based on an input sequence.
 * This function determines the final valid range [lowerBound, upperBound]
 * by iteratively adjusting it based on divisors from a numerical sequence.
 *
 * @returns {string} A string representing the final lower and upper bounds, or an error message.
 */
function executeProblemSolver() {
    // Read the initial index (k) from the input. It's 1-indexed in problem, convert to 0-indexed.
    let initialConstraintIndex = dataInputReader.getNextValue() - 1;

    // Read the sequence of numbers (a) from the next line.
    const inputSequence = dataInputReader.readCurrentLineTokens();

    // Basic validation for the input sequence.
    if (!Array.isArray(inputSequence) || inputSequence.length === 0) {
        return "ERROR: The numerical sequence provided is empty or invalid.";
    }
    if (initialConstraintIndex < 0 || initialConstraintIndex >= inputSequence.length) {
        return "ERROR: Initial constraint index is out of bounds.";
    }

    // Check the value at the initial constraint index. It must be 2.
    // The index `initialConstraintIndex` is decremented *after* this check,
    // so the loop starts from `initialConstraintIndex - 1`.
    const valueAtIndexK = inputSequence[initialConstraintIndex];
    if (valueAtIndexK !== 2) {
        return -1; // Specific problem requirement
    }
    initialConstraintIndex--; // Decrement for the loop starting point

    // Initialize the lower and upper bounds of the range.
    // These represent the initial valid range [2, 3].
    let currentUpperRange = 3;
    let currentLowerRange = 2;

    // Iterate backwards through the input sequence from the decremented initial index down to 0.
    for (let iterationIndex = initialConstraintIndex; iterationIndex >= 0; iterationIndex--) {
        const currentDivisor = inputSequence[iterationIndex];

        // Additional validation for the current divisor.
        if (typeof currentDivisor !== 'number' || !Number.isInteger(currentDivisor) || currentDivisor <= 0) {
            return `ERROR: Invalid divisor '${currentDivisor}' encountered at index ${iterationIndex}. Must be a positive integer.`;
        }

        // Guard clause: If the current divisor is greater than the current upper range,
        // it's impossible to satisfy the divisibility conditions.
        if (currentDivisor > currentUpperRange) {
            return -1; // Specific problem requirement
        }

        // Calculate the new lower bound (currentLowerRange):
        // It must be the smallest multiple of `currentDivisor` that is greater than or equal to the existing `currentLowerRange`.
        const newLowerRangeMultiple = currentDivisor * Math.ceil(currentLowerRange / currentDivisor);
        currentLowerRange = newLowerRangeMultiple;

        // Calculate the new upper bound (currentUpperRange):
        // This involves ensuring `currentUpperRange + 1` is a multiple of `currentDivisor`.
        // `currentDivisor * Math.ceil(currentUpperRange / currentDivisor)` finds the smallest multiple of `currentDivisor` that is >= currentUpperRange.
        // Let's call this `minMultipleGE_currentUpperRange`.
        // The new upper bound `currentUpperRange` must be `minMultipleGE_currentUpperRange - 1`.
        // However, it also needs to be at least `currentLowerRange + currentDivisor - 1` to accommodate the `[d, d+k-1]` structure.
        const minMultipleGE_currentUpperRange = currentDivisor * Math.ceil(currentUpperRange / currentDivisor);
        const candidateUpperLimit = Math.max(minMultipleGE_currentUpperRange, currentLowerRange + currentDivisor);
        currentUpperRange = candidateUpperLimit - 1; // Subtract 1 to get the actual upper bound.
    }

    // After the loop, the final range [currentLowerRange, currentUpperRange] is determined.
    // Return them as a space-separated string.
    return `${currentLowerRange} ${currentUpperRange}`;
}