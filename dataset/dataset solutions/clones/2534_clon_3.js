let InputProcessor = (function () {
    // Helper function to safely convert a value to a number.
    // Returns NaN if conversion is not possible, allowing downstream checks.
    const _toNumber = (val) => {
        const num = Number(val);
        // An explicit check for NaN is often clearer than implicit coercion.
        if (isNaN(num)) {
            // Potentially log an error or throw an exception in a real-world scenario
            // For cloning, we just return NaN as per `+r` behavior for non-numeric.
        }
        return num;
    };

    /**
     * Represents a buffer for processing lines of input.
     * It allows consuming tokens, lines, or blocks of input sequentially.
     * @param {string} rawInputString - The entire input as a single string.
     */
    function InputBuffer(rawInputString) {
        // Store lines, trimming whitespace from each and splitting by newline.
        // This internal array will be mutated for token-based reading.
        this.rawInputLines = rawInputString.trim().split("\n");
        // Pointer to the current line being processed.
        this.currentLineIdx = 0;
    }

    /**
     * Consumes the next token from the current line.
     * Tokens are read from right-to-left on a line.
     * If the current line is exhausted, it moves to the next.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The consumed token, or undefined if no more input.
     */
    InputBuffer.prototype.getNextNumber = function (returnAsString = false) {
        // Ensure we haven't run out of lines.
        if (this.currentLineIdx >= this.rawInputLines.length) {
            return undefined; // No more input to read.
        }

        let currentLineContent = this.rawInputLines[this.currentLineIdx];

        // If the current line content is still a string, it needs to be split and reversed.
        // This is a quirky behavior from the original, where the input array is mutated.
        if (typeof currentLineContent === "string") {
            // Split by space, reverse to read from right-to-left, and store back.
            this.rawInputLines[this.currentLineIdx] = currentLineContent.split(" ").reverse();
        }

        let tokenArray = this.rawInputLines[this.currentLineIdx];
        let nextToken = tokenArray.pop(); // Get the next token (from the right/reversed array).

        // If the line is now empty after popping, advance to the next line.
        if (tokenArray.length === 0) {
            this.currentLineIdx++;
        }

        // Return as string or convert to number based on the flag.
        return returnAsString ? nextToken : _toNumber(nextToken);
    };

    /**
     * Consumes an entire line, splits it into tokens, and optionally converts them to numbers.
     * Advances the line cursor.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputBuffer.prototype.getLineAsNumbers = function (returnAsStrings = false) {
        if (this.currentLineIdx >= this.rawInputLines.length) {
            return []; // No more input.
        }

        const lineString = String(this.rawInputLines[this.currentLineIdx++]);
        const tokens = lineString.split(" ");

        return returnAsStrings ? tokens : tokens.map(_toNumber);
    };

    /**
     * Consumes `numLines` consecutive lines, splitting each into tokens,
     * and optionally converting them to numbers, forming a matrix.
     * Advances the line cursor by `numLines`.
     * @param {number} numLines - The number of lines to read for the matrix.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    InputBuffer.prototype.getMatrixOfNumbers = function (numLines, returnAsStrings = false) {
        // Guard clause for invalid number of lines or insufficient remaining lines.
        if (numLines <= 0 || this.currentLineIdx + numLines > this.rawInputLines.length) {
            console.warn(`Attempted to read ${numLines} lines for matrix, but only ${this.rawInputLines.length - this.currentLineIdx} remaining.`);
            return [];
        }

        const matrix = [];
        for (let i = 0; i < numLines; i++) {
            const lineString = String(this.rawInputLines[this.currentLineIdx + i]);
            const tokens = lineString.split(" ");
            matrix.push(returnAsStrings ? tokens : tokens.map(_toNumber));
        }
        this.currentLineIdx += numLines; // Advance the cursor by the number of lines read.
        return matrix;
    };

    /**
     * Consumes `numLines` consecutive lines, returning them as an array.
     * Optionally converts each line to a number if it contains a single numeric value.
     * Advances the line cursor by `numLines`.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    InputBuffer.prototype.getLinesAsNumbers = function (numLines, returnAsStrings = false) {
        // Guard clause for invalid number of lines or insufficient remaining lines.
        if (numLines <= 0 || this.currentLineIdx + numLines > this.rawInputLines.length) {
            console.warn(`Attempted to read ${numLines} lines, but only ${this.rawInputLines.length - this.currentLineIdx} remaining.`);
            return [];
        }

        const lines = this.rawInputLines.slice(this.currentLineIdx, this.currentLineIdx + numLines);
        this.currentLineIdx += numLines; // Advance the cursor.

        return returnAsStrings ? lines : lines.map(_toNumber);
    };

    /**
     * Factory function to create an InputBuffer instance.
     * @param {string} inputData - The raw input string.
     * @returns {InputBuffer} A new InputBuffer instance.
     */
    function createProcessor(inputData) {
        return new InputBuffer(inputData);
    }

    return createProcessor;
})();

// Initialize the input data stream by reading from standard input.
const inputDataStream = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates an N-dimensional array initialized with a specific value.
 * This function replaces the original `xArray` which used `eval`.
 * @param {*} initialFillerValue - The value to fill the array elements with.
 * @param {...number} dimensions - A list of non-negative integer dimensions for the array.
 * @returns {Array} An N-dimensional array.
 * @throws {Error} If any dimension is invalid (not a non-negative integer).
 */
const createNdimArray = (initialFillerValue, ...dimensions) => {
    // Inner recursive helper function to build the array.
    const buildArray = (remainingDimensions) => {
        // Base case: If no more dimensions, return the filler value.
        if (remainingDimensions.length === 0) {
            return initialFillerValue;
        }

        const currentDimension = remainingDimensions[0];

        // Dimension validation: must be a non-negative integer.
        if (!Number.isInteger(currentDimension) || currentDimension < 0) {
            throw new Error(`Invalid array dimension: ${currentDimension}. Dimensions must be non-negative integers.`);
        }

        // Create an array for the current dimension.
        // Use Array.from with a callback to ensure new instances for nested arrays.
        return Array.from({ length: currentDimension }, () =>
            buildArray(remainingDimensions.slice(1)) // Recursively build the next dimension.
        );
    };

    // Start building the array with all provided dimensions.
    return buildArray(dimensions);
};

// Define a large number to represent an unreachable state or infinity for cost calculations.
const MAX_POSSIBLE_COST = 1_000_000_000; // Using underscore for readability (ES2021 feature).

// The main logic of the program.
function processSolution() {
    // Read the total number of distinct items (N) and the total number of packages (M).
    const numItems = inputDataStream.getNextNumber();
    const numPackages = inputDataStream.getNextNumber();

    // Basic input validation.
    if (numItems <= 0 || numPackages <= 0) {
        console.error("Error: Number of items or packages must be positive.");
        return -1; // Indicate an error or impossible scenario.
    }

    // Arrays to store the cost of each package and the bitmask of items it contains.
    const packageCosts = new Array(numPackages);
    const packageItemBitmasks = new Array(numPackages);

    // --- Package Data Parsing Loop ---
    // Read details for each package (cost and items it provides).
    for (let packageIndex = 0; packageIndex < numPackages; packageIndex++) {
        packageCosts[packageIndex] = inputDataStream.getNextNumber(); // Cost of the current package.

        const itemCountForPackage = inputDataStream.getNextNumber(); // Number of items in this package.
        let currentPackageMask = 0; // Initialize bitmask for this package.

        // Loop to read each item index and update the package's bitmask.
        for (let itemCounter = 0; itemCounter < itemCountForPackage; itemCounter++) {
            const itemIndex = inputDataStream.getNextNumber(); // 1-indexed item ID.
            // Set the corresponding bit for the item (e.g., item 1 -> bit 0, item 2 -> bit 1).
            currentPackageMask |= (1 << (itemIndex - 1));
        }
        packageItemBitmasks[packageIndex] = currentPackageMask; // Store the calculated bitmask.
    }

    // --- Dynamic Programming Setup ---
    // Calculate the total number of possible item combinations (states).
    // A state is represented by a bitmask where each bit corresponds to an item.
    const totalItemCombinations = 1 << numItems;

    // `minCostTable` will store the minimum cost to acquire a specific set of items (represented by its bitmask).
    // Initialize all states with MAX_POSSIBLE_COST (infinity), meaning they are currently unreachable.
    const minCostTable = createNdimArray(MAX_POSSIBLE_COST, totalItemCombinations);

    // The state where no items are acquired (bitmask 0) has a cost of 0.
    minCostTable[0] = 0;

    // --- Dynamic Programming Calculation ---
    // Iterate through all possible item combination states.
    for (let currentStateMask = 0; currentStateMask < totalItemCombinations; currentStateMask++) {
        // If the current state is unreachable, skip it as it cannot lead to a cheaper path.
        if (minCostTable[currentStateMask] === MAX_POSSIBLE_COST) {
            continue;
        }

        // Iterate through each available package.
        for (let pkgIndex = 0; pkgIndex < numPackages; pkgIndex++) {
            // Calculate the new state after purchasing the current package.
            // The bitwise OR operation combines the items from the current state
            // with the items provided by the package.
            const nextStateMask = currentStateMask | packageItemBitmasks[pkgIndex];

            // Calculate the cost to reach this new state by buying the current package.
            const costToReachNextState = minCostTable[currentStateMask] + packageCosts[pkgIndex];

            // If this new path is cheaper than any previously found path to `nextStateMask`, update the cost.
            if (costToReachNextState < minCostTable[nextStateMask]) {
                minCostTable[nextStateMask] = costToReachNextState;
            }
        }
    }

    // --- Result Retrieval ---
    // The target state is where all items are acquired. This is represented by a bitmask
    // with all `numItems` bits set (e.g., for N=3, it's 111_2 = 7).
    const allItemsAcquiredMask = totalItemCombinations - 1;

    // Check the minimum cost to reach the state where all items are acquired.
    const finalMinCost = minCostTable[allItemsAcquiredMask];

    // If the cost is still MAX_POSSIBLE_COST, it means it's impossible to acquire all items.
    if (finalMinCost === MAX_POSSIBLE_COST) {
        return -1; // Indicate impossibility.
    } else {
        return finalMinCost; // Return the minimum cost.
    }
}

// Execute the main solution function and print its result to standard output.
console.log(processSolution());