var InputProcessorFactory = (function () {
    /**
     * Represents a buffer for processing lines of input, providing methods to extract tokens or lines.
     * @private
     */
    function StreamBufferReader(inputContent) {
        // Private storage for all input lines, trimmed and split by newline.
        this._sourceLines = inputContent.trim().split("\n");
        // Pointer to the current line being processed.
        this._lineCursor = 0;
        // Buffer for tokens from the current line, allowing token-by-token consumption.
        this._currentTokenBuffer = [];
    }

    /**
     * Retrieves the next available token from the input stream.
     * If the current line's token buffer is empty, it advances to the next line.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts conversion to a number.
     * @returns {string|number|undefined} The next token, or undefined if no more tokens are available.
     */
    StreamBufferReader.prototype.readNextToken = function (asString) {
        // If the current token buffer is empty, try to load tokens from the next line.
        while (this._currentTokenBuffer.length === 0 && this._lineCursor < this._sourceLines.length) {
            const currentLine = this._sourceLines[this._lineCursor];
            // Split by one or more whitespace characters, filtering out empty strings.
            this._currentTokenBuffer = (currentLine || '').split(/\s+/).filter(Boolean);
            this._lineCursor++; // Move to the next line after processing this one.
        }

        const token = this._currentTokenBuffer.shift(); // Get the first token from the buffer.

        if (token === undefined) {
            return undefined; // No more tokens.
        }

        // Convert to number unless asString is true.
        return asString ? token : Number(token);
    };

    /**
     * Reads all tokens from the current line and advances the line cursor.
     * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    StreamBufferReader.prototype.readLineTokens = function (asString) {
        if (this._lineCursor >= this._sourceLines.length) {
            return []; // No more lines.
        }
        // Consume any remaining tokens from the current buffer before reading a new line.
        this._currentTokenBuffer = [];

        const lineContent = this._sourceLines[this._lineCursor++];
        const tokens = (lineContent || '').split(/\s+/).filter(Boolean);

        return asString ? tokens : tokens.map(token => Number(token));
    };

    /**
     * Reads a block of 'numLines' lines, parsing each into an array of tokens.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    StreamBufferReader.prototype.readTokenMatrix = function (numLines, asString) {
        const matrixData = [];
        // Ensure the token buffer is cleared before reading full lines.
        this._currentTokenBuffer = [];

        for (let i = 0; i < numLines; i++) {
            if (this._lineCursor >= this._sourceLines.length) {
                break; // Ran out of lines.
            }
            const lineContent = this._sourceLines[this._lineCursor++];
            const tokens = (lineContent || '').split(/\s+/).filter(Boolean);
            matrixData.push(asString ? tokens : tokens.map(token => Number(token)));
        }
        return matrixData;
    };

    /**
     * Reads a block of 'numLines' lines as raw strings.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsNumbers=false] - If true, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw line strings or numbers.
     */
    StreamBufferReader.prototype.readRawLineBlock = function (numLines, returnAsNumbers) {
        // Ensure the token buffer is cleared before reading full lines.
        this._currentTokenBuffer = [];
        const rawLines = this._sourceLines.slice(this._lineCursor, this._lineCursor + numLines);
        this._lineCursor += numLines;
        return returnAsNumbers ? rawLines.map(line => Number(line)) : rawLines;
    };

    /**
     * Factory function to create a new StreamBufferReader instance.
     * @param {string} inputString - The raw string content to be parsed.
     * @returns {StreamBufferReader} A new instance of StreamBufferReader.
     */
    function createReaderInstance(inputString) {
        return new StreamBufferReader(inputString);
    }

    return createReaderInstance;
})();

// Initialize the input reader with content from standard input.
// This is typical for competitive programming setups.
var inputReader = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates an N-dimensional array initialized with a specified value or function.
 * Replaces the original 'eval' based implementation for safety and clarity.
 * @param {any} initialValue - The value to initialize array elements with.
 * @param {Array<number>} dimensions - An array of numbers specifying the size of each dimension.
 * @returns {Array} The N-dimensional array.
 */
function initializeMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);

    return Array(currentDimSize).fill(null).map(() => {
        // If initialValue is a function, call it for each leaf node.
        // Otherwise, pass it down for further array creation.
        const valueToPass = typeof initialValue === 'function' && remainingDims.length === 0
                            ? initialValue()
                            : initialValue;
        return initializeMultiArray(valueToPass, ...remainingDims);
    });
}


/**
 * Main function to solve the problem: calculate the maximum number of consecutive occurrences
 * of a pattern string within a source string, considering repetitions of the pattern itself.
 * @returns {number} The maximum count, or -1 if the pattern effectively repeats infinitely within the source.
 */
function calculateMaxPatternOccurrences() {
    // Read the primary source string and the pattern string.
    const sourceString = inputReader.readNextToken(true); // Read as string
    const patternString = inputReader.readNextToken(true); // Read as string

    // Handle edge cases
    if (!sourceString || sourceString.length === 0) {
        return 0;
    }
    if (!patternString || patternString.length === 0) {
        return 0; // An empty pattern does not "occur" in a meaningful way for this problem.
    }

    // Determine if the pattern itself is a repetition of a smaller unit.
    const patternRepetitionCount = determineStringRepeatFactor(patternString);
    let effectivePattern = patternString;

    // If the pattern is "abcabc", its effective unit is "abc" and count is 2.
    if (patternRepetitionCount > 1) {
        effectivePattern = patternString.slice(0, patternString.length / patternRepetitionCount);
    }
    const effectivePatternLength = effectivePattern.length;

    // Create a search space by concatenating the source string multiple times.
    // This allows detecting consecutive occurrences that might wrap around the source string's boundaries.
    const primarySearchArea = sourceString + sourceString; // s + s
    const fullSearchSpace = primarySearchArea + sourceString; // s + s + s

    let maxConsecutiveOccurrences = 0;
    let currentConsecutiveCount = 0;
    let searchStartIndex = 0; // The starting index for the next search in the primarySearchArea.

    // Find occurrences within the 's + s' part.
    // This handles cases where `t` spans the `s` boundary.
    while (searchStartIndex < primarySearchArea.length) {
        const foundIndex = primarySearchArea.indexOf(effectivePattern, searchStartIndex);

        if (foundIndex === -1) {
            break; // No more occurrences in the current search area.
        }

        // If the pattern is found immediately after the previous one, increment count.
        if (foundIndex === searchStartIndex) {
            currentConsecutiveCount++;
        } else {
            // A gap was found, so the consecutive sequence is broken.
            // Update max if current count is higher, then reset for a new sequence.
            if (currentConsecutiveCount > maxConsecutiveOccurrences) {
                maxConsecutiveOccurrences = currentConsecutiveCount;
            }
            currentConsecutiveCount = 1; // Start a new sequence with the current match.
        }
        // Advance searchStartIndex to the end of the current pattern match.
        searchStartIndex = foundIndex + effectivePatternLength;
    }

    // After the loop, one last check for the sequence that might have ended at the very end of primarySearchArea.
    if (currentConsecutiveCount > maxConsecutiveOccurrences) {
        maxConsecutiveOccurrences = currentConsecutiveCount;
    }

    // Special check for 'infinite' repetition:
    // This occurs if the pattern (or its effective unit) perfectly divides the source string,
    // and the source string itself is a repetition of the pattern.
    // The original logic checks if the pattern continues from where the `s+s` part ends
    // into the third `s` part, without any break.
    const potentialInfiniteStartIndex = sourceString.length * 2; // Where the third 's' starts in 's+s+s'
    const finalMatchCheckIndex = fullSearchSpace.indexOf(effectivePattern, potentialInfiniteStartIndex);

    // If the pattern is found exactly at the boundary of `s+s` and the third `s`, AND
    // the previous sequence ended right at that boundary, it implies an 'infinite' repetition.
    // This condition `finalMatchCheckIndex === potentialInfiniteStartIndex` is key.
    if (finalMatchCheckIndex === potentialInfiniteStartIndex) {
        currentConsecutiveCount++; // Increment for this potential boundary match.
        if (currentConsecutiveCount > maxConsecutiveOccurrences) {
            return -1; // Indicates infinite repetitions.
        }
    }

    // The final result is the maximum count divided by the pattern's internal repetition factor.
    // Use Math.floor for integer division.
    return Math.floor(maxConsecutiveOccurrences / patternRepetitionCount);
}

/**
 * Determines the maximum number of times a prefix of a string can repeat to form the entire string.
 * For example, "abcabc" has a repeat factor of 2 (from "abc"). "aaaa" has 4 (from "a"). "abc" has 1.
 * @param {string} inputStr - The string to analyze.
 * @returns {number} The repetition factor. Returns 1 if no repetition, or if the string is empty/single char.
 */
function determineStringRepeatFactor(inputStr) {
    const strLength = inputStr.length;
    if (strLength <= 1) {
        return 1; // Single character or empty string has a repetition factor of 1.
    }

    // Find all proper divisors of the string length. These are potential lengths for the repeating unit.
    const potentialUnitLengths = findProperDivisorsSorted(strLength);

    for (const unitLen of potentialUnitLengths) {
        const numRepeats = strLength / unitLen; // How many times this unit would repeat.
        // Check if the string is formed by repeating its prefix of 'unitLen' length 'numRepeats' times.
        if (inputStr.substring(0, unitLen).repeat(numRepeats) === inputStr) {
            return numRepeats;
        }
    }
    return 1; // No repeating unit found, so the string itself is the unit.
}

/**
 * Finds all proper divisors (excluding the number itself) of a given positive integer, sorted in ascending order.
 * Corrects a bug in the original implementation (`r/i` changed to `numberToFactor/i`).
 * @param {number} numberToFactor - The positive integer to find divisors for.
 * @returns {Array<number>} An array of sorted proper divisors.
 */
function findProperDivisorsSorted(numberToFactor) {
    if (numberToFactor <= 0) {
        return []; // No proper divisors for non-positive numbers.
    }
    if (numberToFactor === 1) {
        return [1]; // 1 is its only proper divisor (itself).
    }

    const lowDivisors = [1]; // Always include 1.
    const highDivisors = [];
    const sqrtInt = Math.floor(Math.sqrt(numberToFactor));

    for (let currentDivisor = 2; currentDivisor <= sqrtInt; currentDivisor++) {
        if (numberToFactor % currentDivisor === 0) {
            lowDivisors.push(currentDivisor);
            if (currentDivisor * currentDivisor !== numberToFactor) { // Avoid adding sqrt twice
                highDivisors.push(numberToFactor / currentDivisor);
            }
        }
    }
    // Concatenate and reverse the high divisors to maintain sorted order.
    return lowDivisors.concat(highDivisors.reverse());
}

// Standard competitive programming execution block.
// If no command-line arguments are provided (e.g., just `node script.js`),
// it forks a new process with a larger stack size. This is common for
// problems involving deep recursion or large data structures.
if (process.argv.length <= 2) {
    // Fork a child process to run this script with increased stack memory.
    // This can prevent "Maximum call stack size exceeded" errors for certain algorithms.
    require("child_process").fork(process.argv[1], ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    // When run directly or as the forked child process, execute the main logic.
    // console.time("Execution Time"); // Optional: for performance measurement
    console.log(calculateMaxPatternOccurrences());
    // console.timeEnd("Execution Time");
}