const fileSystem = require('node:fs');

/**
 * Manages standard input operations, buffering and parsing lines.
 * This class ensures that input is read efficiently and can be
 * accessed line by line or as a block.
 */
class StandardInputHandler {
    #bufferedInputContent = null; // Stores the raw string content read from stdin.
    #parsedInputLines = [];       // Array of individual lines after splitting.
    #currentLinePointer = 0;      // Index of the next line to be returned.

    /**
     * Constructs a new StandardInputHandler instance.
     * Initializes internal state variables.
     */
    constructor() {
        // Private fields are initialized to their default values.
        // The input source is expected to be loaded explicitly.
    }

    /**
     * Loads or reloads the content from the standard input source.
     * This method reads the entire '/dev/stdin' file, splits it into lines,
     * and resets the line pointer to the beginning.
     * Throws an error if the input file cannot be read.
     */
    loadInputSource() {
        try {
            this.#bufferedInputContent = fileSystem.readFileSync('/dev/stdin', { encoding: 'utf8' });
            // Split by newline, accounting for both LF and CRLF, and filter out empty lines
            // that might result from trailing newlines or multiple consecutive newlines.
            this.#parsedInputLines = this.#bufferedInputContent.split(/\r?\n/).filter(line => line.length > 0);
            this.#currentLinePointer = 0; // Reset pointer for fresh reading.
        } catch (error) {
            console.error('Failed to read from standard input:', error.message);
            // In a competitive programming context, usually just exit or throw
            process.exit(1);
        }
    }

    /**
     * Retrieves the next available line from the standard input.
     * If all lines have been read, it attempts to reload the input source.
     * @returns {string} The next line from stdin.
     */
    retrieveNextLine() {
        // Ensure input is loaded if we've reached the end or it's not loaded yet.
        if (this.#currentLinePointer >= this.#parsedInputLines.length) {
            this.loadInputSource();
            // If after loading, there are still no lines, it means stdin was empty.
            if (this.#parsedInputLines.length === 0) {
                return ''; // Or throw an error, depending on desired behavior for empty input.
            }
        }
        return this.#parsedInputLines[this.#currentLinePointer++];
    }

    /**
     * Retrieves all remaining lines from the standard input as an array.
     * After this call, the line pointer will be at the end of the input.
     * @returns {string[]} An array containing all lines from the current pointer to the end.
     */
    retrieveAllRemainingLines() {
        // Similar check to ensure data is available.
        if (this.#currentLinePointer >= this.#parsedInputLines.length) {
            this.loadInputSource();
            if (this.#parsedInputLines.length === 0) {
                return []; // No lines available.
            }
        }
        const startingIndex = this.#currentLinePointer;
        this.#currentLinePointer = this.#parsedInputLines.length; // Mark all lines as read.
        return this.#parsedInputLines.slice(startingIndex);
    }
}

// Instantiate our input handler.
const inputSourceReader = new StandardInputHandler();

/*
 * BEGIN: Utility extensions for built-in JavaScript prototypes.
 * These extensions provide convenient methods for common data transformations.
 * They are defined as non-enumerable properties to avoid polluting iteration loops.
 */

// Adds a method to Array.prototype to convert all elements to integers.
Object.defineProperty(Array.prototype, 'mapToInts', {
    value: function() {
        // Using Number.parseInt with radix 10 for explicit base conversion.
        return this.map(item => Number.parseInt(item, 10));
    },
    enumerable: false
});

// Adds a method to Array.prototype to convert all elements to floating-point numbers.
Object.defineProperty(Array.prototype, 'mapToFloats', {
    value: function() {
        return this.map(item => Number.parseFloat(item));
    },
    enumerable: false
});

// Adds a method to Array.prototype to convert all elements to strings.
Object.defineProperty(Array.prototype, 'mapToStrings', {
    value: function() {
        return this.map(item => String(item));
    },
    enumerable: false
});

// Adds a method to Array.prototype to fill its elements based on a generator function.
Object.defineProperty(Array.prototype, 'fillWithGeneratedValues', {
    value: function(generatorCallback) {
        if (typeof generatorCallback !== 'function') {
            console.warn('fillWithGeneratedValues expects a function callback.');
            return this; // Return original array if callback is invalid.
        }
        for (let idx = 0; idx < this.length; ++idx) {
            this[idx] = generatorCallback(idx);
        }
        return this; // Allows method chaining.
    },
    enumerable: false
});

// Adds a method to Array.prototype to find the maximum value, optionally using a selector.
Object.defineProperty(Array.prototype, 'findMaxValue', {
    value: function(valueSelector = item => item) {
        if (this.length === 0) {
            return undefined; // Consistent with original behavior for empty arrays.
        }
        // Use reduce to find the maximum, applying the selector function to each item.
        return this.reduce((currentMax, currentItem, index) => {
            const itemValue = valueSelector(currentItem, index);
            return (currentMax === undefined || itemValue > currentMax) ? itemValue : currentMax;
        }, undefined); // Start with undefined to correctly handle first element.
    },
    enumerable: false
});

// Adds a method to Array.prototype to find the minimum value, optionally using a selector.
Object.defineProperty(Array.prototype, 'findMinValue', {
    value: function(valueSelector = item => item) {
        if (this.length === 0) {
            return undefined; // Consistent with original behavior for empty arrays.
        }
        // Use reduce to find the minimum, applying the selector function.
        return this.reduce((currentMin, currentItem, index) => {
            const itemValue = valueSelector(currentItem, index);
            return (currentMin === undefined || itemValue < currentMin) ? itemValue : currentMin;
        }, undefined); // Start with undefined.
    },
    enumerable: false
});

// Adds a method to Array.prototype to calculate the sum of its elements, optionally using a selector.
Object.defineProperty(Array.prototype, 'calculateTotalSum', {
    value: function(valueSelector = item => item) {
        // Reduce gracefully handles empty arrays by returning the initial value (0).
        return this.reduce((accumulator, currentItem, index) => {
            const itemValue = valueSelector(currentItem, index);
            // Ensure itemValue is treated as a number in case selector returns non-numeric.
            return accumulator + (typeof itemValue === 'number' ? itemValue : 0);
        }, 0); // Initial sum is 0.
    },
    enumerable: false
});

// Adds a method to Number.prototype to execute a callback a specified number of times.
Object.defineProperty(Number.prototype, 'executeTimes', {
    value: function(actionCallback) {
        const iterationCount = this.valueOf(); // Get the primitive number value.
        const resultsArray = [];
        for (let i = 0; i < iterationCount; ++i) {
            resultsArray.push(actionCallback ? actionCallback(i) : i);
        }
        return resultsArray; // Returns an array of results from each callback execution.
    },
    enumerable: false
});

/*
 * END: Utility extensions.
 */

// --- Main program logic starts here ---

// Read the first line which contains N (number of rows) and M (number of columns).
const dimensionInputLine = inputSourceReader.retrieveNextLine().split(' ');
const [totalRows, totalColumns] = dimensionInputLine.mapToInts();

// Validate input dimensions.
if (totalRows < 0 || totalColumns < 0) {
    console.error("Error: Grid dimensions cannot be negative.");
    process.exit(1);
}
// For the specific problem (WBR flag), we need at least 3 rows.
if (totalRows < 3) {
    // If N < 3, it's impossible to form W, B, R regions.
    // The cost would be totalRows * totalColumns (all pixels need changing).
    // The original code would result in N*M, so we'll do the same.
    process.stdout.write(String(totalRows * totalColumns) + '\n');
    process.exit(0);
}


// Read the entire grid data (S) based on the number of rows (N).
// Each row is a string representing a sequence of characters (colors).
const colorGridData = totalRows.executeTimes(() => inputSourceReader.retrieveNextLine());

// A cache mechanism to store calculated costs for specific rows and target colors.
// Using a Map for better key handling (e.g., composite keys as strings).
const rowCostCache = new Map();

/**
 * Calculates the cost (number of mismatches) to make a given row
 * entirely of a specified target color.
 * The result is cached for performance.
 * @param {number} rowIndex - The 0-based index of the row to calculate cost for.
 * @param {string} desiredColor - The single character string representing the target color ('W', 'B', 'R').
 * @returns {number} The number of characters in the row that are NOT the desired color.
 */
const calculateRowMismatchCost = (rowIndex, desiredColor) => {
    // Create a unique cache key for the row and color.
    const cacheIdentifier = `${rowIndex}-${desiredColor}`;

    // Check if the result is already in the cache.
    if (rowCostCache.has(cacheIdentifier)) {
        return rowCostCache.get(cacheIdentifier);
    }

    let mismatchedPixelsCount = 0;
    const currentRowString = colorGridData[rowIndex];

    // Iterate through each character (pixel) in the row.
    for (let charIndex = 0; charIndex < totalColumns; ++charIndex) {
        if (currentRowString[charIndex] !== desiredColor) {
            mismatchedPixelsCount++;
        }
    }

    // The cost is the number of pixels that need to be changed.
    const calculatedCost = mismatchedPixelsCount;

    // Store the result in the cache before returning.
    rowCostCache.set(cacheIdentifier, calculatedCost);
    return calculatedCost;
};

// Initialize variables for tracking costs and the overall minimum.
let currentWhiteRegionCost = 0; // Accumulates cost for the 'W' region.
// Initialize minimum total cost to a very large value (or max possible).
let overallMinimumPaintCost = totalRows * totalColumns; // Max possible cost.

// The problem involves partitioning N rows into three contiguous regions: White, Blue, Red.
// W region: rows 0 to i (inclusive)
// B region: rows i+1 to j (inclusive)
// R region: rows j+1 to N-1 (inclusive)
// We need to find i and j that minimize the total cost.
// i must be at least 0. j must be at least i+1. j+1 must be less than N.
// So, i < j < N-1.
// The loops define the boundaries: whiteRegionEndRow (i), blueRegionEndRow (j).

// Outer loop: Determines the end row for the 'W' region.
// 'whiteRegionEndRow' can range from 0 to totalRows - 3 (inclusive).
// If whiteRegionEndRow is totalRows - 3, then blueRegionEndRow must be totalRows - 2,
// and redRegionStartRow must be totalRows - 1.
for (let whiteRegionEndRow = 0; whiteRegionEndRow <= totalRows - 3; ++whiteRegionEndRow) {
    // Add the cost of making the current row white to the running total for the white region.
    currentWhiteRegionCost += calculateRowMismatchCost(whiteRegionEndRow, 'W');

    let currentBlueRegionCost = 0; // Accumulates cost for the 'B' region for this 'W' boundary.

    // Middle loop: Determines the end row for the 'B' region.
    // 'blueRegionEndRow' must be after 'whiteRegionEndRow' and before totalRows - 1.
    for (let blueRegionEndRow = whiteRegionEndRow + 1; blueRegionEndRow <= totalRows - 2; ++blueRegionEndRow) {
        // Add the cost of making the current row blue.
        currentBlueRegionCost += calculateRowMismatchCost(blueRegionEndRow, 'B');

        let currentRedRegionCost = 0; // Accumulates cost for the 'R' region for this 'W' and 'B' boundary.

        // Inner loop: Calculates the cost for the 'R' region.
        // The 'R' region starts immediately after 'blueRegionEndRow' and goes to the end.
        // This loop is slightly different from the original, which iterated `k` from `j+1` to `N`.
        // Here, `redRegionStartRow` is equivalent to `k`.
        for (let redRegionStartRow = blueRegionEndRow + 1; redRegionStartRow < totalRows; ++redRegionStartRow) {
            currentRedRegionCost += calculateRowMismatchCost(redRegionStartRow, 'R');
        }

        // Calculate the total cost for the current partition (W, B, R regions).
        const combinedPartitionCost = currentWhiteRegionCost + currentBlueRegionCost + currentRedRegionCost;

        // Update the overall minimum cost if the current partition is cheaper.
        overallMinimumPaintCost = Math.min(overallMinimumPaintCost, combinedPartitionCost);
    }
}

// Output the final calculated minimum cost.
// Using process.stdout.write for potentially faster output in competitive programming.
process.stdout.write(String(overallMinimumPaintCost) + '\n');