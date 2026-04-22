"use strict";

// Solution for a grid path counting problem using dynamic programming.
// This implementation processes input from stdin, calculates path counts
// based on specific arrangement rules (similar to Fibonacci sequence),
// and outputs the result modulo a large prime.

/**
 * Global cache for Fibonacci-like sequence values, specifically representing
 * the number of valid ways to arrange items in `n` empty slots such that
 * no two items are adjacent. This corresponds to F(n+1) in the standard
 * Fibonacci sequence, where F(0)=0, F(1)=1, F(2)=1, F(3)=2, etc.
 *
 * `fibonacciArrangementCache[i]` stores the number of ways for `i` slots.
 * So, `fibonacciArrangementCache[0]` is F(1)=1 (for 0 slots).
 * `fibonacciArrangementCache[1]` is F(2)=1 (for 1 slot).
 * `fibonacciArrangementCache[2]` is F(3)=2 (for 2 slots).
 */
const fibonacciArrangementCache = [1, 1]; // Initial values for 0 and 1 empty slots

/**
 * Calculates the number of valid arrangements for a given number of empty slots.
 * This function uses memoization to efficiently compute Fibonacci-like numbers.
 *
 * @param {number} numEmptySlots The number of consecutive empty slots available.
 * @returns {number} The count of valid arrangements. Returns 1 for negative slot counts
 *                   to handle boundary conditions in DP transitions, effectively treating
 *                   non-existent slots as having one "empty" arrangement.
 */
function calculateValidArrangements(numEmptySlots) {
    if (numEmptySlots < 0) {
        return 1;
    }
    while (fibonacciArrangementCache.length <= numEmptySlots) {
        const nextValue = fibonacciArrangementCache[fibonacciArrangementCache.length - 1] +
                          fibonacciArrangementCache[fibonacciArrangementCache.length - 2];
        fibonacciArrangementCache.push(nextValue);
    }
    return fibonacciArrangementCache[numEmptySlots];
}

/**
 * A utility class for parsing input strings line by line and token by token.
 * It supports converting tokens to a specified data type.
 */
class InputProcessor {
    /**
     * @private
     * @type {string[]} Stores the input string split into individual lines, with each line trimmed.
     */
    sourceLines;

    /**
     * @private
     * @type {number} The index of the current line being processed.
     */
    currentLineIdx;

    /**
     * @private
     * @type {number} The index of the current token within the current line.
     */
    currentSegmentIdx;

    /**
     * @private
     * @type {Function} A function to convert parsed tokens to a desired type (e.g., Number).
     */
    typeConverter;

    /**
     * Initializes the InputProcessor with the raw input string and an optional conversion function.
     * @param {string} rawInput The complete input string, typically read from a file.
     * @param {Function} [converter=Number] An optional function to convert tokens (default is Number).
     */
    constructor(rawInput, converter = Number) {
        this.sourceLines = rawInput.split("\n").map(line => line.trim()); // Trim lines immediately
        this.currentSegmentIdx = 0;
        this.currentLineIdx = 0;
        this.typeConverter = converter;
    }

    /**
     * Retrieves the next token from the input stream. If the current line is exhausted,
     * it moves to the next line. Empty lines are skipped.
     * @returns {any | undefined} The next token, converted to the specified type, or undefined if no more tokens.
     */
    getNextToken() {
        // Skip empty lines until a non-empty line or end of input is reached
        while (this.currentLineIdx < this.sourceLines.length && !this.sourceLines[this.currentLineIdx]) {
            this.currentLineIdx++;
            this.currentSegmentIdx = 0; // Reset segment index for the new (empty) line
        }

        if (this.currentLineIdx >= this.sourceLines.length) {
            return undefined; // No more lines left
        }

        const activeLine = this.sourceLines[this.currentLineIdx];
        const lineSegments = activeLine.split(/\s+/).filter(s => s.length > 0); // Robustly split by one or more spaces, filter empty strings

        if (this.currentSegmentIdx >= lineSegments.length) {
            // Current line exhausted, move to the next line and reset segment index
            this.currentLineIdx++;
            this.currentSegmentIdx = 0;
            // Recursively call to get token from the new line, or handle end of input
            return this.getNextToken();
        }

        const segmentValue = lineSegments[this.currentSegmentIdx];
        this.currentSegmentIdx++;

        return this.typeConverter(segmentValue);
    }

    /**
     * Reads and processes all tokens from the current line, then advances to the next line.
     * @returns {any[] | undefined} An array of tokens from the current line, or undefined if no more lines.
     */
    readEntireLine() {
        // Skip empty lines
        while (this.currentLineIdx < this.sourceLines.length && !this.sourceLines[this.currentLineIdx]) {
            this.currentLineIdx++;
            this.currentSegmentIdx = 0;
        }

        if (this.currentLineIdx >= this.sourceLines.length) {
            return undefined; // No more lines left
        }

        const activeLine = this.sourceLines[this.currentLineIdx];
        this.currentLineIdx++; // Advance line pointer
        this.currentSegmentIdx = 0; // Reset token pointer for future getNextToken calls

        return activeLine.split(/\s+/).filter(s => s.length > 0).map(this.typeConverter);
    }
}

/**
 * Initializes a multi-dimensional array (matrix) with specified dimensions and a fill value.
 * This function ensures that nested arrays are distinct objects, allowing independent modification.
 *
 * @param {number[]} dimensions An array of numbers specifying the size of each dimension (e.g., [rows, cols]).
 * @param {any} fillValue The initial value to populate all elements with.
 * @returns {any} The initialized multi-dimensional array.
 * @throws {Error} If invalid dimensions are provided.
 */
function initializeMultiDimensionalArray(dimensions, fillValue) {
    if (!Array.isArray(dimensions) || dimensions.some(d => !Number.isInteger(d) || d <= 0)) {
        throw new Error("Invalid dimensions provided for array initialization. Dimensions must be positive integers.");
    }

    let resultStructure = fillValue; // Start with the innermost value

    // Iterate dimensions in reverse to build up the nested array structure
    for (let i = dimensions.length - 1; i >= 0; i--) {
        const currentDimensionSize = dimensions[i];
        const newLevel = Array(currentDimensionSize).fill(null).map(() => {
            // Deep copy the resultStructure for each element at the current level.
            // This ensures that all nested arrays/objects are distinct instances,
            // preventing unintended shared references.
            return JSON.parse(JSON.stringify(resultStructure));
        });
        resultStructure = newLevel;
    }
    return resultStructure;
}

/**
 * A large prime number used for modulo operations in dynamic programming calculations
 * to prevent integer overflow and keep results within a manageable range.
 */
const MODULO_CONSTANT = 1000000007;

/**
 * Performs modular addition.
 * @param {number} a The first operand.
 * @param {number} b The second operand.
 * @returns {number} The result of (a + b) % MODULO_CONSTANT.
 */
const addModulo = (a, b) => (a + b) % MODULO_CONSTANT;

/**
 * Performs modular multiplication.
 * @param {number} a The first operand.
 * @param {number} b The second operand.
 * @returns {number} The result of (a * b) % MODULO_CONSTANT.
 */
const multiplyModulo = (a, b) => (a * b) % MODULO_CONSTANT;

/**
 * The main function that orchestrates the problem-solving logic.
 * It reads input, initializes the DP table, performs calculations, and prints the final result.
 * @param {string} inputString The raw input data from stdin.
 */
function solveProblem(inputString) {
    const parserInstance = new InputProcessor(inputString);

    const gridHeight = parserInstance.getNextToken();
    const gridWidth = parserInstance.getNextToken();
    const targetPathColumn = parserInstance.getNextToken(); // k is 1-indexed

    // --- Input Validation ---
    if (gridHeight === undefined || gridWidth === undefined || targetPathColumn === undefined) {
        console.error("Error: Not enough input values provided.");
        return;
    }
    if (gridHeight <= 0 || gridWidth <= 0 || targetPathColumn <= 0 || targetPathColumn > gridWidth) {
        console.error(`Error: Invalid grid dimensions or target column. Height: ${gridHeight}, Width: ${gridWidth}, Target Column: ${targetPathColumn}`);
        return;
    }

    // Initialize the dynamic programming table.
    // pathCountMatrix[row][col] stores the number of ways to reach (row, col).
    const pathCountMatrix = initializeMultiDimensionalArray([gridHeight, gridWidth], 0);

    // --- Initialize the first row (row 0) of the DP table ---
    // For the first row, each column 'colIdx' can be an open path.
    // The number of ways to arrange bars to the left of 'colIdx' is calculateValidArrangements(colIdx - 1).
    // The number of ways to arrange bars to the right of 'colIdx' is calculateValidArrangements(gridWidth - 1 - colIdx).
    // The product gives the total ways for the first row to have an open path at 'colIdx'.
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
        pathCountMatrix[0][colIdx] = multiplyModulo(
            calculateValidArrangements(colIdx - 1),
            calculateValidArrangements(gridWidth - 1 - colIdx)
        );
    }

    // --- Fill the DP table for subsequent rows ---
    // Iterate through rows starting from the second row (index 1)
    for (let rowIdx = 1; rowIdx < gridHeight; rowIdx++) {
        // Iterate through each column in the current row
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            let currentCellTotalWays = 0;

            // Case 1: Path comes from the same column (`colIdx`) in the previous row (`rowIdx - 1`).
            // The arrangements for the current row around `colIdx` are:
            // (ways for slots to the left of `colIdx`) * (ways for slots to the right of `colIdx`).
            const arrangementsForStay = multiplyModulo(
                calculateValidArrangements(colIdx),
                calculateValidArrangements(gridWidth - 1 - colIdx)
            );
            currentCellTotalWays = addModulo(
                currentCellTotalWays,
                multiplyModulo(pathCountMatrix[rowIdx - 1][colIdx], arrangementsForStay)
            );

            // Case 2: Path comes from the column to the left (`colIdx - 1`) in the previous row.
            // This implies a bar is placed at `colIdx - 1`, and the path moves to `colIdx`.
            // Arrangements: (ways for slots to the left of `colIdx - 1`) * (ways for slots to the right of `colIdx`).
            if (colIdx > 0) {
                const arrangementsForLeftShift = multiplyModulo(
                    calculateValidArrangements(colIdx - 1),
                    calculateValidArrangements(gridWidth - 1 - colIdx)
                );
                currentCellTotalWays = addModulo(
                    currentCellTotalWays,
                    multiplyModulo(pathCountMatrix[rowIdx - 1][colIdx - 1], arrangementsForLeftShift)
                );
            }

            // Case 3: Path comes from the column to the right (`colIdx + 1`) in the previous row.
            // This implies a bar is placed at `colIdx`, and the path moves from `colIdx + 1` to `colIdx`.
            // Arrangements: (ways for slots to the left of `colIdx`) * (ways for slots to the right of `colIdx + 1`).
            if (colIdx < gridWidth - 1) {
                const arrangementsForRightShift = multiplyModulo(
                    calculateValidArrangements(colIdx),
                    calculateValidArrangements(gridWidth - 2 - colIdx)
                );
                currentCellTotalWays = addModulo(
                    currentCellTotalWays,
                    multiplyModulo(pathCountMatrix[rowIdx - 1][colIdx + 1], arrangementsForRightShift)
                );
            }

            pathCountMatrix[rowIdx][colIdx] = currentCellTotalWays;
        }
    }

    // --- Output the final result ---
    // The targetPathColumn is 1-indexed, so convert to 0-indexed.
    const finalResultColumnIndex = targetPathColumn - 1;
    if (finalResultColumnIndex < 0 || finalResultColumnIndex >= gridWidth) {
        // This case should ideally be caught by initial input validation, but added as a safeguard.
        console.error(`Error: Calculated target column index ${finalResultColumnIndex} is out of bounds for grid width ${gridWidth}.`);
        return;
    }
    console.log(pathCountMatrix[gridHeight - 1][finalResultColumnIndex]);
}

// --- Entry point for execution ---
try {
    const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
    solveProblem(inputData);
} catch (error) {
    console.error("An error occurred while processing input:", error.message);
    process.exit(1); // Indicate an error occurred
}