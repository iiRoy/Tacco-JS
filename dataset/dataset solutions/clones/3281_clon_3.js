const InputProcessor = (function () {
    /**
     * Factory function responsible for instantiating an InputReader object.
     * This is the primary entry point for obtaining a parser instance.
     * @param {string} rawSourceText - The complete input content as a single string.
     *                                 Typically, this would be read from a file or standard input.
     * @returns {InputReader} An initialized InputReader instance ready for data extraction.
     */
    function createReader(rawSourceText) {
        // Construct and return a new data reader, passing the raw text for internal processing.
        return new InputReader(rawSourceText);
    }

    /**
     * Internal helper function to safely convert a string value into a numeric type.
     * This ensures consistency in number parsing throughout the InputReader methods.
     * @param {string} stringValue - The string representation of a number.
     * @returns {number} The numeric value, or NaN if the conversion is unsuccessful.
     */
    const convertToNumericValue = (stringValue) => {
        // The Number() constructor provides a clear and direct way to perform this conversion.
        return Number(stringValue);
    };

    /**
     * @class InputReader
     * @description
     * Manages the sequential parsing of input data, treating it as a series of lines and tokens.
     * It maintains an internal state to track the current position within the input.
     */
    function InputReader(inputContent) {
        // The entire input content is first trimmed to remove any leading/trailing whitespace
        // from the whole block, then split into an array of individual lines.
        this.sourceLines = inputContent.trim().split("\n");
        // 'currentLineIndex' acts as a pointer, indicating which line is currently being processed
        // or is next in line for processing. It starts at the beginning of the input.
        this.currentLineIndex = 0;
        // 'currentLineTokenBuffer' stores individual words (tokens) from the most recently
        // accessed line, allowing for sequential extraction of tokens from that specific line.
        this.currentLineTokenBuffer = [];
    }

    /**
     * Extracts a single token (word) from the input stream. By default, it attempts to
     * convert the token to a number. If the current line's token buffer is empty,
     * it automatically loads the next available line.
     * @param {boolean} [shouldReturnAsString=false] - If true, the token is returned as a string;
     *                                                 otherwise, it's converted to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more input is available.
     */
    InputReader.prototype.readSingleToken = function (shouldReturnAsString = false) {
        // If the buffer for the current line's tokens is empty, we need to load a new line.
        if (this.currentLineTokenBuffer.length === 0) {
            // Check if there are any lines left in the source input.
            if (this.currentLineIndex >= this.sourceLines.length) {
                // If no more lines, it signifies the end of the input.
                return undefined;
            }

            // Retrieve the next line and then increment the line pointer.
            const lineUnderConsideration = this.sourceLines[this.currentLineIndex++];
            // Split the line into individual tokens based on spaces.
            // The original logic implicitly read tokens from left-to-right (first word).
            // Using `split(" ")` and then `shift()` achieves this directly.
            this.currentLineTokenBuffer = lineUnderConsideration.split(" ");
        }

        // Extract the next token from the beginning of the buffer.
        const tokenValue = this.currentLineTokenBuffer.shift();

        // If for some reason `shift()` returns undefined (e.g., an empty line resulted in an empty buffer),
        // or if the token itself is an empty string and we're at the end of the buffer, handle it.
        // The original code handled empty lines by just moving to the next.
        if (tokenValue === undefined || tokenValue === '') {
            // If it was an empty string, and we still have more tokens, we should try again.
            // This handles cases like "  1 2" where the first token is empty.
            // For simplicity and matching typical competitive programming input,
            // assume tokens are non-empty unless it's a completely empty line.
            // If we want to strictly match `pop()` on `reverse()` which would discard initial empty strings:
            // "  1 2".split(" ").reverse().pop() -> ["","","1","2"].reverse() -> ["2","1","",""].pop() -> ""
            // So, let's keep it simple: if it's an empty string, and we expect a number, it will become NaN.
            // If it's undefined, it's truly end of input.
            if (tokenValue === undefined && this.currentLineTokenBuffer.length === 0) {
                return undefined; // No more tokens on this line and no more lines.
            }
            // If it's an empty string and we're supposed to return a number, it will be NaN.
            // If it's an empty string and we're supposed to return a string, it will be "".
        }

        // Return the token, either as a string or after attempting numeric conversion.
        return shouldReturnAsString ? tokenValue : convertToNumericValue(tokenValue);
    };

    /**
     * Reads and processes an entire line of input, splitting it into multiple tokens.
     * @param {boolean} [shouldReturnAsStrings=false] - If true, returns an array of strings;
     *                                                  otherwise, attempts to convert all tokens to numbers.
     * @returns {Array<string|number>|undefined} An array of parsed values for the line,
     *                                           or undefined if no more lines are available.
     */
    InputReader.prototype.readFullLineTokens = function (shouldReturnAsStrings = false) {
        // Verify that there are still lines remaining to be read.
        if (this.currentLineIndex >= this.sourceLines.length) {
            return undefined; // Indicate that the end of input has been reached.
        }

        // Extract the content of the current line and then advance the line pointer.
        const lineContent = this.sourceLines[this.currentLineIndex++];
        // Split the line into an array of tokens (words) based on space delimiters.
        const tokensArray = lineContent.split(" ");

        // It's important to clear any buffered tokens from the *previous* line when reading a new full line.
        this.currentLineTokenBuffer = [];

        // Handle cases where a line might be empty or contain only whitespace, resulting in `[""]`.
        if (tokensArray.length === 1 && tokensArray[0] === "") {
            return []; // An empty line should result in an empty array of tokens.
        }

        // Return the tokens, either as strings or converted to numeric values.
        return shouldReturnAsStrings ? tokensArray : tokensArray.map(convertToNumericValue);
    };

    /**
     * Reads a specified number of consecutive lines, interpreting each as a row in a matrix.
     * Each row is further split into tokens.
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [shouldReturnAsStrings=false] - If true, returns a 2D array of strings;
     *                                                  otherwise, a 2D array of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the parsed matrix.
     * @throws {Error} If `numberOfLines` is not a positive integer.
     */
    InputReader.prototype.readInputMatrix = function (numberOfLines, shouldReturnAsStrings = false) {
        // Input validation for the number of lines to ensure proper usage.
        if (!Number.isInteger(numberOfLines) || numberOfLines <= 0) {
            throw new Error("Invalid argument: 'numberOfLines' must be a positive integer for matrix reading.");
        }

        // Check if there are sufficient lines remaining in the input to fulfill the request.
        if (this.currentLineIndex + numberOfLines > this.sourceLines.length) {
            console.warn(`Warning: Requested to read ${numberOfLines} matrix rows, but only ` +
                         `${this.sourceLines.length - this.currentLineIndex} lines are available. ` +
                         `Reading available lines only.`);
            // Adjust `numberOfLines` to prevent reading beyond the end of the input.
            numberOfLines = this.sourceLines.length - this.currentLineIndex;
            if (numberOfLines <= 0) {
                return []; // Return an empty matrix if no lines are left.
            }
        }

        const parsedMatrix = [];
        // Iterate for the specified number of lines, processing each as a matrix row.
        for (let i = 0; i < numberOfLines; i++) {
            // Utilize `readFullLineTokens` to parse each individual line into an array of tokens.
            const rowData = this.readFullLineTokens(shouldReturnAsStrings);
            if (rowData !== undefined) {
                parsedMatrix.push(rowData);
            } else {
                // If `readFullLineTokens` returns undefined, it implies an unexpected end of input.
                // Stop processing and return the partial matrix collected so far.
                console.warn(`Input unexpectedly ended while reading matrix at line ${this.currentLineIndex}.`);
                break;
            }
        }
        return parsedMatrix;
    };

    /**
     * Reads a specified number of consecutive lines, interpreting each line as a single scalar value.
     * @param {number} countOfScalarLines - The total number of scalar lines to read.
     * @param {boolean} [shouldReturnAsStrings=false] - If true, returns an array of strings;
     *                                                  otherwise, an array of numbers.
     * @returns {Array<string|number>} An array containing the parsed scalar values.
     * @throws {Error} If `countOfScalarLines` is not a positive integer.
     */
    InputReader.prototype.readScalarLines = function (countOfScalarLines, shouldReturnAsStrings = false) {
        // Validate the input parameter to ensure it's a valid positive integer.
        if (!Number.isInteger(countOfScalarLines) || countOfScalarLines <= 0) {
            throw new Error("Invalid argument: 'countOfScalarLines' must be a positive integer.");
        }

        // Check if there are enough lines remaining in the input to satisfy the request.
        if (this.currentLineIndex + countOfScalarLines > this.sourceLines.length) {
            console.warn(`Warning: Requested to read ${countOfScalarLines} scalar lines, but only ` +
                         `${this.sourceLines.length - this.currentLineIndex} lines are available. ` +
                         `Reading available lines only.`);
            // Adjust `countOfScalarLines` to prevent out-of-bounds access.
            countOfScalarLines = this.sourceLines.length - this.currentLineIndex;
            if (countOfScalarLines <= 0) {
                return []; // Return an empty array if no lines are left.
            }
        }

        // Extract the relevant lines directly using `slice`. This is efficient for contiguous blocks.
        const relevantLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + countOfScalarLines);
        // Advance the internal line pointer by the number of lines just processed.
        this.currentLineIndex += countOfScalarLines;

        // Clear the token buffer, as these lines were processed as whole scalars, not individual tokens.
        this.currentLineTokenBuffer = [];

        // Map each line to its processed value, applying numeric conversion if required.
        const scalarValues = relevantLines.map(line => {
            // Trim each line to ensure only the actual scalar value is processed, removing any extraneous whitespace.
            const trimmedLine = line.trim();
            return shouldReturnAsStrings ? trimmedLine : convertToNumericValue(trimmedLine);
        });

        return scalarValues;
    };

    // The IIFE returns the factory function, which is the public interface to create an InputProcessor.
    return createReader;
})();

// Initialize the input data parser by reading the entire content from standard input.
// This `dataParser` instance will be used throughout the main logic to extract values.
const dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Main function to execute the problem's logic: categorizing elements and finding a minimum count.
 * This function reads several numeric parameters and an array, then classifies each array element
 * into one of three distinct categories based on two defined bounds.
 * @returns {number} The smallest count among the three categories of elements.
 *                   Returns -1 or logs errors if critical input validation fails.
 */
function processElementCategorization() {
    // Read the total number of elements expected in the input array.
    // This value is critical for loop bounds and array size validation.
    const totalElementsCount = dataParser.readSingleToken();
    // Validate 'totalElementsCount': it must be a non-negative integer.
    if (typeof totalElementsCount !== 'number' || !Number.isInteger(totalElementsCount) || totalElementsCount < 0) {
        console.error("Error: The total number of elements (N) is invalid. Expected a non-negative integer.");
        return -1; // Indicate a critical input error.
    }

    // Read the lower boundary for element categorization.
    const lowerBoundaryValue = dataParser.readSingleToken();
    // Validate 'lowerBoundaryValue': it must be a valid number.
    if (typeof lowerBoundaryValue !== 'number' || isNaN(lowerBoundaryValue)) {
        console.error("Error: The lower boundary value (A) is invalid. Expected a numeric value.");
        return -1;
    }

    // Read the upper boundary for element categorization.
    const upperBoundaryValue = dataParser.readSingleToken();
    // Validate 'upperBoundaryValue': it must be a valid number.
    if (typeof upperBoundaryValue !== 'number' || isNaN(upperBoundaryValue)) {
        console.error("Error: The upper boundary value (B) is invalid. Expected a numeric value.");
        return -1;
    }

    // Read the array of numbers that need to be categorized.
    // This assumes the array elements are provided on a single line.
    const numericInputArray = dataParser.readFullLineTokens();
    // Validate 'numericInputArray': ensure it's an array and its length matches 'totalElementsCount'.
    if (!Array.isArray(numericInputArray) || numericInputArray.length !== totalElementsCount) {
        console.error(`Error: Input array size mismatch. Expected ${totalElementsCount} elements, ` +
                      `but received ${numericInputArray ? numericInputArray.length : 0}.`);
        return -1;
    }

    // Initialize counters for the three defined categories.
    // Category 1: Elements that are less than or equal to the lower boundary.
    let countCategoryOne = 0;
    // Category 2: Elements that are strictly greater than the upper boundary.
    let countCategoryTwo = 0;
    // Category 3: Elements that fall between the lower and upper boundaries (exclusive of lower, inclusive of upper).
    // This is equivalent to totalElements - countCategoryOne - countCategoryTwo.
    let countCategoryThree = 0;

    // Iterate through each element in the input array to classify it.
    for (let currentIdx = 0; currentIdx < totalElementsCount; currentIdx++) {
        const elementToCategorize = numericInputArray[currentIdx];

        // Perform basic validation for each individual element.
        if (typeof elementToCategorize !== 'number' || isNaN(elementToCategorize)) {
            console.warn(`Warning: Non-numeric or invalid element found at index ${currentIdx}. Value: '${elementToCategorize}'. Skipping this element.`);
            continue; // Skip invalid elements to prevent errors in categorization.
        }

        // Apply the categorization logic based on the defined boundaries.
        if (elementToCategorize <= lowerBoundaryValue) {
            countCategoryOne++;
        } else if (elementToCategorize > upperBoundaryValue) {
            countCategoryTwo++;
        } else {
            // If an element is neither <= lowerBoundaryValue nor > upperBoundaryValue,
            // it must fall within the range (lowerBoundaryValue, upperBoundaryValue].
            // This implicitly means `elementToCategorize > lowerBoundaryValue && elementToCategorize <= upperBoundaryValue`.
            countCategoryThree++;
        }
    }

    // After categorization, it's a good practice to verify that all elements were accounted for.
    const totalCategorizedElements = countCategoryOne + countCategoryTwo + countCategoryThree;
    if (totalCategorizedElements !== totalElementsCount) {
        console.warn(`Categorization discrepancy: Expected ${totalElementsCount} elements, but categorized ${totalCategorizedElements}.`);
    }

    // The problem asks for the minimum count among the three categories.
    // This corresponds to `Math.min(countCategoryOne, countCategoryTwo, countCategoryThree)`.
    const finalMinimumCount = Math.min(countCategoryOne, countCategoryTwo, countCategoryThree);

    return finalMinimumCount;
}

// Execute the primary function to process the input and print the resulting minimum count to the console.
console.log(processElementCategorization());