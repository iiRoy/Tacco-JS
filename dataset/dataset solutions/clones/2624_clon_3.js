const InputProcessorFactory = (() => {
    // Helper to create a data processing instance from raw input.
    function createProcessor(rawInputContent) {
        return new TextContentProcessor(rawInputContent);
    }

    // Class for parsing text-based input data.
    class TextContentProcessor {
        #sourceLines; // Stores individual lines of input.
        #currentLinePointer; // Tracks the current line being processed.
        #currentTokenBuffer = null; // Buffer for tokens of the current line.
        #currentTokenPointer = 0; // Pointer within the current token buffer.

        // Initializes the processor with the raw input string.
        constructor(inputString) {
            // Trim whitespace, split by newlines (handling both \n and \r\n),
            // and filter out any resulting empty lines.
            this.#sourceLines = inputString
                .trim()
                .split(/\r?\n/)
                .filter(line => line.length > 0);
            this.#currentLinePointer = 0;
        }

        // Prepares the token buffer for the current line.
        #prepareLineTokens() {
            // If no more lines are available, reset buffer and pointers.
            if (this.#currentLinePointer >= this.#sourceLines.length) {
                this.#currentTokenBuffer = null;
                this.#currentTokenPointer = 0;
                return false; // Indicates no more lines to process.
            }

            const currentLine = this.#sourceLines[this.#currentLinePointer];
            // Split the line by any whitespace and filter out empty tokens.
            this.#currentTokenBuffer = currentLine.split(/\s+/).filter(token => token.length > 0);
            this.#currentTokenPointer = 0;
            return true; // Indicates a new line's tokens are prepared.
        }

        // Advances the line pointer if all tokens on the current line have been consumed.
        #advanceLineIfNeeded() {
            if (this.#currentTokenBuffer && this.#currentTokenPointer >= this.#currentTokenBuffer.length) {
                this.#currentLinePointer++;
                this.#currentTokenBuffer = null; // Clear buffer to force re-preparation for the next line.
                this.#currentTokenPointer = 0;
            }
        }

        // Retrieves the next scalar value (token) from the input stream.
        retrieveScalar(returnAsString = false) {
            // If the buffer is empty or exhausted, attempt to prepare the next line.
            if (!this.#currentTokenBuffer || this.#currentTokenPointer >= this.#currentTokenBuffer.length) {
                this.#advanceLineIfNeeded(); // First, check if current line is exhausted and advance.
                if (!this.#prepareLineTokens()) { // Then, try to prepare tokens for the new current line.
                    return undefined; // No more input available.
                }
            }

            const token = this.#currentTokenBuffer[this.#currentTokenPointer];
            this.#currentTokenPointer++;
            this.#advanceLineIfNeeded(); // Advance line pointer immediately if this was the last token.

            return returnAsString ? token : Number(token); // Explicit conversion to number.
        }

        // Reads all tokens from the current line and then advances to the next line.
        grabLineItems(asRawStrings = false) {
            if (this.#currentLinePointer >= this.#sourceLines.length) {
                return []; // Guard: No more lines to read.
            }

            const currentLineContent = this.#sourceLines[this.#currentLinePointer];
            this.#currentLinePointer++; // Advance line pointer.

            // Clear any pending token buffer as the entire line is now consumed.
            this.#currentTokenBuffer = null;
            this.#currentTokenPointer = 0;

            const tokens = currentLineContent.split(/\s+/).filter(token => token.length > 0);

            return asRawStrings ? tokens : tokens.map(item => Number(item));
        }

        // Extracts a block of 'lineCount' lines, parsing each into an array of tokens (a matrix).
        pullGridData(lineCount, asRawStrings = false) {
            if (lineCount <= 0) return []; // Guard: Invalid count.
            // Adjust lineCount if it exceeds remaining lines.
            if (this.#currentLinePointer + lineCount > this.#sourceLines.length) {
                lineCount = this.#sourceLines.length - this.#currentLinePointer;
            }

            const extractedLines = this.#sourceLines.slice(this.#currentLinePointer, this.#currentLinePointer + lineCount);
            this.#currentLinePointer += lineCount; // Advance line pointer.

            // Clear any pending token buffer.
            this.#currentTokenBuffer = null;
            this.#currentTokenPointer = 0;

            const matrix = extractedLines.map(line => {
                const tokens = line.split(/\s+/).filter(token => token.length > 0);
                return asRawStrings ? tokens : tokens.map(item => Number(item));
            });
            return matrix;
        }

        // Retrieves a contiguous segment of 'count' lines as an array.
        retrieveSegment(count, asRawStrings = false) {
            if (count <= 0) return []; // Guard: Invalid count.
            // Adjust count if it exceeds remaining lines.
            if (this.#currentLinePointer + count > this.#sourceLines.length) {
                count = this.#sourceLines.length - this.#currentLinePointer;
            }

            const segment = this.#sourceLines.slice(this.#currentLinePointer, this.#currentLinePointer + count);
            this.#currentLinePointer += count; // Advance line pointer.

            // Clear any pending token buffer.
            this.#currentTokenBuffer = null;
            this.#currentTokenPointer = 0;

            return asRawStrings ? segment : segment.map(line => Number(line));
        }
    }

    return createProcessor; // Return the factory function.
})();

// Helper function for creating multi-dimensional arrays, replacing the eval-based xArray.
function createNestedArray(initialValueSupplier, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValueSupplier();
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const result = new Array(currentDimSize); // Pre-allocate array for efficiency.
    for (let k = 0; k < currentDimSize; k++) {
        result[k] = createNestedArray(initialValueSupplier, ...remainingDims);
    }
    return result;
}

let inputDataProcessor;
try {
    const fileSystemModule = require("fs");
    const rawInputText = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    inputDataProcessor = InputProcessorFactory(rawInputText);
} catch (error) {
    // Log error and provide a dummy processor for demonstration if file read fails.
    // In a production environment, this would typically lead to process exit or a more robust error handling.
    console.error("Error reading input from /dev/stdin:", error.message);
    inputDataProcessor = InputProcessorFactory("0"); // Dummy input: N=0, leading to empty output.
}

// Executes the main logic to calculate and format the bitwise property matrix.
function calculateBitwisePropertyMatrix() {
    const dimensionSize = inputDataProcessor.retrieveScalar();

    // Validate the input dimension size.
    if (typeof dimensionSize !== 'number' || !Number.isInteger(dimensionSize) || dimensionSize < 0) {
        console.error("Invalid or missing dimension size N in input.");
        return "";
    }
    if (dimensionSize <= 1) {
        // For N=0 or N=1, the inner loop (j=i+1) will not execute,
        // resulting in an empty matrix or a matrix with no filled values.
        // The expected output format for an empty matrix is an empty string.
        return "";
    }

    // Initialize the result matrix.
    // The original code's `xArray("[]", n-1)` was problematic for direct assignment.
    // This revised initialization creates an N x (N-1) matrix filled with zeros,
    // which aligns with the column indexing `j-i-1` (max `N-2` columns needed).
    const resultMatrix = createNestedArray(() => 0, dimensionSize, dimensionSize - 1);

    // Populate the result matrix based on the bitwise XOR property.
    for (let rowIndex = 0; rowIndex < dimensionSize; rowIndex++) {
        for (let colIndex = rowIndex + 1; colIndex < dimensionSize; colIndex++) {
            const xorResult = rowIndex ^ colIndex;

            let bitPositionFactor;
            // The original `while(b%2 === 0)b >>= 1, t++;` loop calculates
            // the position of the least significant bit (LSB) + 1.
            // This can be directly calculated using `Math.log2` and bitwise operations.
            // `xorResult & -xorResult` isolates the LSB.
            if (xorResult === 0) {
                // This case should not occur as `rowIndex` is not equal to `colIndex`.
                bitPositionFactor = 0;
            } else {
                bitPositionFactor = Math.floor(Math.log2(xorResult & -xorResult)) + 1;
            }

            // Store the calculated factor.
            // The column index is derived from `colIndex`, `rowIndex`, and a fixed offset.
            resultMatrix[rowIndex][colIndex - rowIndex - 1] = bitPositionFactor;
        }
    }

    // Format the resulting matrix into a single string:
    // Each row's elements are joined by a space, and rows are joined by a newline.
    const formattedOutput = resultMatrix
        .map(row => row.join(" "))
        .join("\n");

    return formattedOutput;
}

// Execute the main calculation and output the result to the console.
console.log(calculateBitwisePropertyMatrix());