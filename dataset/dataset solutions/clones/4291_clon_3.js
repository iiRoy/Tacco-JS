const TRANSFORMATION_TYPE = {
    TO_INTEGER: 1,
    TO_SPACE_STRINGS: 2,
    TO_SPACE_INTEGERS: 4,
    TO_CHAR_ARRAY: 6,
    TO_CHAR_INT_ARRAY: 7, // Not used in this specific problem, but kept for completeness
    JOIN_WITH_SPACE: 8, // Not used
    JOIN_WITH_NEWLINE: 9, // Not used
    JOIN_NO_DELIMITER: 0 // Not used
};

// Global instance for handling input stream
let inputProcessorInstance = initializeInputReader();

// Entry point for the application logic
processMainLogic();

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The next integer.
 */
function readInteger() {
    return dataTransformer(fetchNextLine(), TRANSFORMATION_TYPE.TO_INTEGER);
}

/**
 * Retrieves the next line as an array of strings, split by spaces.
 * @returns {string[]} An array of strings.
 */
function readSpaceSeparatedStrings() {
    return dataTransformer(fetchNextLine(), TRANSFORMATION_TYPE.TO_SPACE_STRINGS);
}

/**
 * Retrieves the next line as an array of integers, split by spaces.
 * @returns {number[]} An array of integers.
 */
function readSpaceSeparatedIntegers() {
    return dataTransformer(fetchNextLine(), TRANSFORMATION_TYPE.TO_SPACE_INTEGERS);
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
    return dataTransformer(fetchNextLine(), TRANSFORMATION_TYPE.TO_CHAR_ARRAY);
}

/**
 * Fetches the very next line from the initialized input source.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
    // Delegates to the input processor's method
    return inputProcessorInstance.fetchNextLine();
}

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function hasMoreLines() {
    // Delegates to the input processor's method
    return inputProcessorInstance.canAdvance();
}

/**
 * Reads all raw input lines from standard input.
 * @returns {string[]} An array of strings, each representing a line of input.
 */
function fetchRawInput() {
    // Utilizes Node.js 'fs' module to synchronously read from /dev/stdin
    // Trims whitespace from the overall input and splits it into an array by newline.
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Initializes and returns an object responsible for managing input lines.
 * This object acts as an iterator over the input received from `fetchRawInput`.
 * @returns {object} An input processor object with methods to check for next line and retrieve it.
 */
function initializeInputReader() {
    const rawInputLines = fetchRawInput();
    // Early exit and warning for empty input scenarios.
    if (!rawInputLines || rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0] === '')) {
        printToStderr("Warning: No input lines or empty input received.");
        return {
            lineBuffer: [],
            currentLineIndex: 0,
            totalLinesCount: 0,
            canAdvance: () => false,
            fetchNextLine: () => "" // Always return empty string for consistency
        };
    }

    let currentLinePointer = 0;
    const totalLinesAvailable = rawInputLines.length;

    const inputProcessorState = {
        lineBuffer: rawInputLines,
        currentLineIndex: currentLinePointer,
        totalLinesCount: totalLinesAvailable,
        /**
         * Determines if there are more lines left to read.
         * @returns {boolean} True if `currentLineIndex` is less than `totalLinesCount`.
         */
        canAdvance: function() {
            return this.currentLineIndex < this.totalLinesCount;
        },
        /**
         * Retrieves the next line from the buffer and advances the pointer.
         * @returns {string} The content of the next line, or an empty string if no more lines.
         */
        fetchNextLine: function() {
            if (!this.canAdvance()) {
                return ""; // Return empty string if no more lines, matching original behavior
            }
            const lineContent = this.lineBuffer[this.currentLineIndex];
            this.currentLineIndex++; // Increment pointer after fetching
            return lineContent;
        }
    };
    return inputProcessorState;
}

/**
 * Prints a given value to standard output, typically followed by a newline.
 * @param {*} outputValue The value to be printed.
 */
function printToStdout(outputValue) {
    console.log(outputValue);
}

/**
 * Prints a given value to standard error output.
 * Useful for debugging or non-critical informational messages.
 * @param {*} errorMessage The value to be printed to stderr.
 */
function printToStderr(errorMessage) {
    console.error(errorMessage);
}

/**
 * Performs various data transformations based on a specified type.
 * This function encapsulates common parsing and joining operations.
 *
 * @param {*} inputValue The input value to transform.
 * @param {number} transformationType A constant from `TRANSFORMATION_TYPE` defining the desired transformation.
 * @returns {*} The transformed value. Returns original value on error or unknown type.
 */
function dataTransformer(inputValue, transformationType) {
    try {
        const inputStr = String(inputValue); // Ensure string for split operations
        switch (transformationType) {
            case TRANSFORMATION_TYPE.TO_INTEGER:
                return Number(inputStr); // More robust than parseInt for general numbers
            case TRANSFORMATION_TYPE.TO_SPACE_STRINGS:
                return inputStr.split(" ");
            case TRANSFORMATION_TYPE.TO_SPACE_INTEGERS:
                return inputStr.split(" ").map(Number); // Converts each part to a number
            case TRANSFORMATION_TYPE.TO_CHAR_ARRAY:
                return inputStr.split("");
            case TRANSFORMATION_TYPE.TO_CHAR_INT_ARRAY:
                return inputStr.split("").map(Number);
            case TRANSFORMATION_TYPE.JOIN_WITH_SPACE:
                return Array.isArray(inputValue) ? inputValue.join(" ") : inputStr;
            case TRANSFORMATION_TYPE.JOIN_WITH_NEWLINE:
                return Array.isArray(inputValue) ? inputValue.join("\n") : inputStr;
            case TRANSFORMATION_TYPE.JOIN_NO_DELIMITER:
                return Array.isArray(inputValue) ? inputValue.join("") : inputStr;
            default:
                // If transformation type is unknown, return the original input value.
                printToStderr(`Warning: Unknown transformation type ${transformationType}. Returning original value.`);
                return inputValue;
        }
    } catch (conversionError) {
        // Log the error but return the original value for resilience, matching original behavior.
        printToStderr(`Error during data transformation for value '${inputValue}' (type ${transformationType}): ${conversionError.message}`);
        return inputValue;
    }
}

// Constant for the character 'x' to avoid magic strings.
const TARGET_CHARACTER = 'x';

/**
 * The main application logic function.
 * This function processes a single input string to determine a specific count related to its 'x' characters.
 */
function processMainLogic() {
    const inputSequence = fetchNextLine(); // Get the primary string input

    // Guard clause for empty or invalid input string
    if (!inputSequence || typeof inputSequence !== 'string' || inputSequence.trim().length === 0) {
        printToStdout(-1); // Output -1 for invalid input
        return;
    }

    const sequenceLength = inputSequence.length;
    // Create a version of the string with all 'x' characters removed.
    // This is used to check for palindrome property of non-'x' characters.
    const nonXCharactersOnly = inputSequence.split(TARGET_CHARACTER).join('');

    let reversedNonXCharacters = ''; // Accumulates non-'x' characters in reverse order
    let currentXBlockCount = 0;      // Counts consecutive 'x's
    const xBlockSizes = [];          // Stores the size of each 'x' block encountered

    // Iterate through the input string character by character
    for (let charIndex = 0; charIndex < sequenceLength; ++charIndex) {
        const currentChar = inputSequence[charIndex];

        if (currentChar !== TARGET_CHARACTER) {
            // If the character is not 'x', append it to the reversed non-'x' string.
            // This effectively reverses the sequence of non-'x' characters.
            reversedNonXCharacters = currentChar + reversedNonXCharacters;
            // Push the count of 'x's accumulated *before* this non-'x' character.
            xBlockSizes.push(currentXBlockCount);
            currentXBlockCount = 0; // Reset 'x' count after a non-'x' character
        } else {
            // If the character is 'x', increment the current 'x' block counter.
            currentXBlockCount++;
        }
    }
    // After the loop, add the count of any trailing 'x's to the blocks array.
    xBlockSizes.push(currentXBlockCount);

    // Validate if the string formed by non-'x' characters is a palindrome.
    // If it's not, then the original string cannot be made symmetrical with respect to 'x' counts.
    if (reversedNonXCharacters !== nonXCharactersOnly) {
        printToStdout(-1);
        return;
    }

    let totalOperationsRequired = 0;
    const numberOfBlocks = xBlockSizes.length;
    const halfBlocksCount = Math.floor(numberOfBlocks / 2); // Calculate midpoint for symmetry check

    // Iterate through the first half of the 'x' block sizes to compare with the second half.
    for (let blockIteration = 0; blockIteration < halfBlocksCount; ++blockIteration) {
        const leftBlockValue = xBlockSizes[blockIteration];
        const rightBlockValue = xBlockSizes[numberOfBlocks - 1 - blockIteration];
        // The difference in 'x' counts between symmetric blocks contributes to operations.
        totalOperationsRequired += Math.abs(leftBlockValue - rightBlockValue);
    }

    // The total operations are divided by 2 because each operation balances two sides.
    printToStdout(totalOperationsRequired / 2);
}