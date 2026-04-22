/**
 * InputDataStream: A utility class for parsing input data,
 * mimicking standard input reading for competitive programming.
 * It processes raw string data into lines and tokens.
 */
function InputDataStream(rawData) {
    // Internal buffer storing lines, each split into an array of tokens.
    // Lines are trimmed to remove leading/trailing whitespace before splitting.
    this.processedLines = rawData.split("\n").map(singleLine => singleLine.trim().split(" "));
    // Pointer to the current line being processed.
    this.currentLinePointer = 0;

    // A helper method to conditionally convert a token to a number.
    // This is an added intermediate step for clarity.
    this._convertToNumeric = function(tokenValue, shouldBeNumeric) {
        return shouldBeNumeric ? Number(tokenValue) : tokenValue;
    };
}

// Defining methods for the InputDataStream prototype.
// This uses a slightly different object literal assignment style than the original.
InputDataStream.prototype = {
    /**
     * Extracts and returns a single token from the current line.
     * Advances the internal line pointer if the current line is exhausted.
     * @param {boolean} [returnAsNumber=true] - If true, attempts to convert the token to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more tokens.
     */
    extractToken: function(returnAsNumber = true) {
        // Retrieve the tokens from the current line.
        let tokensOnCurrentLine = this.processedLines[this.currentLinePointer];

        // Guard clause: If current line is undefined or exhausted, try to advance.
        // This handles cases of empty lines or reaching end of input.
        if (!tokensOnCurrentLine || tokensOnCurrentLine.length === 0) {
            this.currentLinePointer++; // Move to the next line.
            tokensOnCurrentLine = this.processedLines[this.currentLinePointer];
            // If still no tokens after advancing, return undefined.
            if (!tokensOnCurrentLine || tokensOnCurrentLine.length === 0) {
                return undefined; // Signifies end of readable input.
            }
        }

        // Use shift() to get the first token (left-to-right reading),
        // which is different from original's reverse() then pop() (right-to-left).
        const nextTokenValue = tokensOnCurrentLine.shift();

        // If the current line is now empty, advance the line pointer for the next read.
        if (tokensOnCurrentLine.length === 0) {
            this.currentLinePointer++;
        }

        return this._convertToNumeric(nextTokenValue, returnAsNumber);
    },

    /**
     * Reads all tokens from the current line and advances the line pointer.
     * @param {boolean} [shouldConvertNumerically=true] - If true, converts all tokens to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    getLineTokens: function(shouldConvertNumerically = true) {
        // Guard for end of input.
        if (this.currentLinePointer >= this.processedLines.length) {
            return []; // Return an empty array if no more lines to read.
        }

        // Fetch the current line's data and immediately advance the pointer.
        const lineContent = this.processedLines[this.currentLinePointer];
        this.currentLinePointer++;

        // Handle cases where a line might be empty or undefined after processing.
        if (!lineContent) {
            return [];
        }

        // Apply numeric conversion using the helper method if requested.
        return shouldConvertNumerically ? lineContent.map(token => Number(token)) : lineContent;
    },

    /**
     * Reads a specified number of lines, processing each into an array of tokens.
     * @param {number} numLinesToRead - The count of lines to fetch.
     * @param {boolean} [convertAllToNumbers=true] - If true, converts all tokens in each line to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the block of lines.
     */
    getLineBlock: function(numLinesToRead, convertAllToNumbers = true) {
        // Guard clause for invalid number of lines.
        if (numLinesToRead <= 0) {
            return [];
        }

        const collectedBlock = [];
        let linesProcessed = 0; // Use a counter for the while loop.

        // Use a while loop for iteration instead of a for loop.
        while (linesProcessed < numLinesToRead && this.currentLinePointer < this.processedLines.length) {
            const currentLineData = this.processedLines[this.currentLinePointer];
            this.currentLinePointer++; // Advance line pointer for each line consumed.

            if (currentLineData) { // Ensure the line data exists.
                // Process the line, converting tokens if needed.
                const processedTokens = convertAllToNumbers ? currentLineData.map(token => Number(token)) : currentLineData;
                collectedBlock.push(processedTokens);
            } else {
                collectedBlock.push([]); // Add an empty array for any truly empty lines encountered.
            }
            linesProcessed++;
        }
        return collectedBlock;
    },
};

// Global constant for modulo arithmetic, renamed and explicitly declared as const.
const PRIME_MODULO = 1000000007;

/**
 * Helper function to apply the modulo operation, ensuring the result is non-negative.
 * This function encapsulates the modulo logic, making the main computation cleaner.
 * @param {number} value - The number to apply modulo to.
 * @returns {number} The result of the modulo operation.
 */
const applyModulo = (value) => {
    return (value % PRIME_MODULO + PRIME_MODULO) % PRIME_MODULO;
};

/**
 * Generates a sequence of Fibonacci-like numbers, starting with F(0)=1, F(1)=1.
 * This replaces the hardcoded `v` array in the original code, allowing dynamic sizing.
 * @param {number} maxRequiredIndex - The maximum index (inclusive) for which to generate a Fibonacci number.
 * @returns {Array<number>} An array containing the Fibonacci-like sequence up to the specified index.
 */
const generateArrangementWays = (maxRequiredIndex) => {
    if (maxRequiredIndex < 0) return [];
    if (maxRequiredIndex === 0) return [1]; // F(0)
    const fibSequence = [1, 1]; // F(0)=1, F(1)=1
    for (let i = 2; i <= maxRequiredIndex; i++) {
        fibSequence.push(fibSequence[i - 1] + fibSequence[i - 2]);
    }
    return fibSequence;
};

/**
 * Main function to solve the dynamic programming problem.
 * Renamed from 'main' to 'determinePathCount' for more descriptive naming.
 */
function determinePathCount() {
    // Initialize the input data stream using a new variable name.
    const inputDataSource = new InputDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));

    // Read problem parameters, using descriptive variable names.
    const gridHeight = inputDataSource.extractToken(true);
    const gridWidth = inputDataSource.extractToken(true);
    const targetColumn = inputDataSource.extractToken(true);

    // Initial guard clauses for invalid input dimensions.
    if (gridHeight < 0 || gridWidth < 1 || targetColumn < 1 || targetColumn > gridWidth) {
        // Output an error message and return a default value for invalid input.
        console.error("Error: Invalid grid dimensions or target column specified.");
        return 0;
    }

    // Special base case handling for a grid with only one column.
    // This condition is moved up for early exit.
    if (gridWidth === 1) {
        return 1;
    }

    // Initialize the dynamic programming table.
    // Using Array.from for array creation, and renaming 'dp' to 'pathCountGrid'.
    const pathCountGrid = Array.from({ length: gridHeight + 1 }, () => Array(gridWidth + 1).fill(0));
    pathCountGrid[0][1] = 1; // Explicitly set the initial base condition for DP.

    // Precompute the arrangement ways (Fibonacci-like sequence) dynamically.
    // The maximum index needed is `gridWidth - 1`.
    const fibArrangementWays = generateArrangementWays(gridWidth - 1);

    // Iterate through each level (row) of the grid, starting from the first level.
    let currentLevel = 1; // Renamed 'i' to 'currentLevel'
    while (currentLevel <= gridHeight) { // Using a while loop instead of a for loop.

        // --- Calculate for the first column (index 1) ---
        // Fetch required Fibonacci numbers, adding `|| 0` for defensive programming
        // in case of very small `gridWidth` values.
        const fibW_minus_1 = fibArrangementWays[gridWidth - 1] || 0;
        const fibW_minus_2 = fibArrangementWays[gridWidth - 2] || 0;

        // Calculate contributions from previous level.
        let contribFromPrevCol1 = pathCountGrid[currentLevel - 1][1] * fibW_minus_1;
        let contribFromPrevCol2 = pathCountGrid[currentLevel - 1][2] * fibW_minus_2;

        // Sum and apply modulo.
        pathCountGrid[currentLevel][1] = applyModulo(contribFromPrevCol1 + contribFromPrevCol2);

        // --- Iterate for intermediate columns (from 2 up to gridWidth - 1) ---
        // Renamed 'j' to 'columnIndex'.
        for (let columnIndex = 2; columnIndex < gridWidth; columnIndex++) {
            // Define indices for clarity.
            const previousColumn = columnIndex - 1;
            const currentColumn = columnIndex;
            const nextColumn = columnIndex + 1;

            // Pre-calculate required Fibonacci values for current column's transitions.
            const fib_j_minus_2 = fibArrangementWays[columnIndex - 2] || 0;
            const fib_w_minus_j = fibArrangementWays[gridWidth - columnIndex] || 0;
            const fib_j_minus_1 = fibArrangementWays[columnIndex - 1] || 0;
            const fib_w_minus_j_minus_1 = fibArrangementWays[gridWidth - columnIndex - 1] || 0;

            // Contribution from the cell to the left in the previous level (j-1).
            let contributionFromLeft = pathCountGrid[currentLevel - 1][previousColumn];
            contributionFromLeft = applyModulo(contributionFromLeft * fib_j_minus_2);
            contributionFromLeft = applyModulo(contributionFromLeft * fib_w_minus_j);

            // Contribution from the cell directly above in the previous level (j).
            let contributionFromSelf = pathCountGrid[currentLevel - 1][currentColumn];
            contributionFromSelf = applyModulo(contributionFromSelf * fib_j_minus_1);
            contributionFromSelf = applyModulo(contributionFromSelf * fib_w_minus_j);

            // Contribution from the cell to the right in the previous level (j+1).
            let contributionFromRight = pathCountGrid[currentLevel - 1][nextColumn];
            contributionFromRight = applyModulo(contributionFromRight * fib_j_minus_1);
            contributionFromRight = applyModulo(contributionFromRight * fib_w_minus_j_minus_1);

            // Sum all contributions for the current cell and apply modulo.
            let totalForCurrentCell = applyModulo(contributionFromLeft + contributionFromSelf);
            totalForCurrentCell = applyModulo(totalForCurrentCell + contributionFromRight);
            pathCountGrid[currentLevel][currentColumn] = totalForCurrentCell;
        }

        // --- Calculate for the last column (index gridWidth) ---
        // Fetch required Fibonacci numbers.
        const fibW_minus_2_last = fibArrangementWays[gridWidth - 2] || 0;
        const fibW_minus_1_last = fibArrangementWays[gridWidth - 1] || 0;

        // Calculate contributions from previous level.
        let contribFromPrevLastMinus1 = pathCountGrid[currentLevel - 1][gridWidth - 1] * fibW_minus_2_last;
        let contribFromPrevLast = pathCountGrid[currentLevel - 1][gridWidth] * fibW_minus_1_last;

        // Sum and apply modulo.
        pathCountGrid[currentLevel][gridWidth] = applyModulo(contribFromPrevLastMinus1 + contribFromPrevLast);

        currentLevel++; // Move to the next level.
    }

    // Return the final computed value from the DP table.
    return pathCountGrid[gridHeight][targetColumn];
}

// Execute the main function and print its result to the console.
console.log(determinePathCount());