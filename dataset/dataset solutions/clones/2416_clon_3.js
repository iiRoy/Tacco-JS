"use strict";

// Input processing utility module. Encapsulates reading data from a stream.
const InputDataStreamProcessor = (function() {

    /**
     * Factory function to create a new input reader instance.
     * @param {string} rawInputContent - The complete raw string content to be parsed.
     * @returns {DataParserInstance} An instance capable of parsing the input.
     */
    function createDataParser(rawInputContent) {
        return new DataParserInstance(rawInputContent);
    }

    /**
     * DataParserInstance: Manages reading tokens and lines from a multi-line string input.
     * It mimics the original's behavior where the `extractSingleValue` method modifies
     * internal state for a line by reversing its tokens for consumption.
     */
    function DataParserInstance(fullInputString) {
        // Stores raw string lines, indexed by line number.
        this.sourceLines = fullInputString.trim().split("\n");
        // A cache for lines that have been processed by `extractSingleValue`.
        // It stores the mutable array of tokens for that line, reversed.
        this.lineTokenBufferCache = new Map();
        // The current line index being processed across all read operations.
        this.currentLinePointer = 0;
    }

    /**
     * Reads the next available token from the input stream.
     * It consumes tokens from the right (end) of the current line,
     * similar to a stack pop operation on the line's tokens.
     * @param {boolean} [returnAsText=false] - If true, returns the token as a string; otherwise, attempts to parse as a number.
     * @returns {string|number|undefined} The next token. Returns NaN if numeric conversion fails,
     *                                    or undefined if attempting to read past end of input.
     */
    DataParserInstance.prototype.extractSingleValue = function(returnAsText = false) {
        // Guard against reading beyond the end of the input.
        if (this.currentLinePointer >= this.sourceLines.length) {
            console.error("InputDataStreamProcessor: Attempted to read beyond the end of the input stream.");
            return undefined;
        }

        let currentLineBuffer = this.lineTokenBufferCache.get(this.currentLinePointer);

        if (!currentLineBuffer) {
            // If this line hasn't been accessed by `extractSingleValue` yet,
            // split it into tokens, reverse them, and cache the mutable array.
            currentLineBuffer = this.sourceLines[this.currentLinePointer].split(" ").reverse();
            this.lineTokenBufferCache.set(this.currentLinePointer, currentLineBuffer);
        }

        const extractedToken = currentLineBuffer.pop();

        // If the current line's buffer is now empty, advance to the next line.
        if (currentLineBuffer.length === 0) {
            this.currentLinePointer++;
            // Clean up cache for the line that's been fully consumed.
            this.lineTokenBufferCache.delete(this.currentLinePointer - 1);
        }

        // Return as string or attempt numeric conversion (mimicking original `+r`).
        return returnAsText ? extractedToken : +extractedToken;
    };

    /**
     * Reads all tokens from the current line and advances to the next line.
     * This method assumes the current line has not been partially consumed by `extractSingleValue`.
     * @param {boolean} [returnAsTexts=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<string|number>} An array of tokens from the line. Returns empty array if past end of input.
     */
    DataParserInstance.prototype.fetchLineTokens = function(returnAsTexts = false) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            console.error("InputDataStreamProcessor: Attempted to read a full line past end of input.");
            return [];
        }

        const rawLineString = this.sourceLines[this.currentLinePointer];
        this.currentLinePointer++; // Advance to the next line.
        this.lineTokenBufferCache.delete(this.currentLinePointer - 1); // Clear cache for the consumed line.

        const tokens = rawLineString.split(" ");
        return returnAsTexts ? tokens : tokens.map(token => +token);
    };

    /**
     * Reads 'numRows' number of lines as a 2D array (matrix).
     * Each line is split into tokens. Assumes no partial consumption by `extractSingleValue`.
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} [returnAsTexts=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens. Returns empty array if insufficient lines.
     */
    DataParserInstance.prototype.readDataMatrix = function(numRows, returnAsTexts = false) {
        if (this.currentLinePointer + numRows > this.sourceLines.length) {
            console.error(`InputDataStreamProcessor: Insufficient lines to read ${numRows} rows for matrix.`);
            return [];
        }

        const matrixResult = [];
        for (let i = 0; i < numRows; i++) {
            const lineString = this.sourceLines[this.currentLinePointer + i];
            this.lineTokenBufferCache.delete(this.currentLinePointer + i); // Clear cache for these lines.
            const tokens = lineString.split(" ");
            matrixResult.push(returnAsTexts ? tokens : tokens.map(token => +token));
        }
        this.currentLinePointer += numRows;
        return matrixResult;
    };

    /**
     * Reads 'numLines' number of lines as a 1D array.
     * Each element of the array is either the raw line string or a number parsed from the entire line.
     * This corresponds to the original `g.prototype.r` method.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsTexts=false] - If true, returns lines as raw strings; otherwise, attempts to parse each entire line as a number.
     * @returns {Array<string|number>} A 1D array of lines. Returns empty array if insufficient lines.
     */
    DataParserInstance.prototype.readLinesIntoArray = function(numLines, returnAsTexts = false) {
        if (this.currentLinePointer + numLines > this.sourceLines.length) {
            console.error(`InputDataStreamProcessor: Insufficient lines to read ${numLines} lines into array.`);
            return [];
        }

        const lineArrayResult = [];
        for (let i = 0; i < numLines; i++) {
            const lineString = this.sourceLines[this.currentLinePointer + i];
            this.lineTokenBufferCache.delete(this.currentLinePointer + i); // Clear cache for these lines.
            lineArrayResult.push(returnAsTexts ? lineString : +lineString); // Convert entire line to number.
        }
        this.currentLinePointer += numLines;
        return lineArrayResult;
    };

    return createDataParser;
})();

// Create an input data parser instance by reading from standard input.
const inputParser = InputDataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a default value.
 * This is a rewritten version of the original `xArray` to avoid `eval` and improve readability.
 * @param {*} defaultValue - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(defaultValue, ...dimensions) {
    // Base case: if no more dimensions, return the default value.
    if (dimensions.length === 0) {
        return defaultValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Basic validation for dimension size.
    if (currentDimensionSize < 0 || !Number.isInteger(currentDimensionSize)) {
        console.warn(`createMultiDimArray: Invalid non-integer or negative dimension size encountered: ${currentDimensionSize}. Returning empty array.`);
        return [];
    }

    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimArray(defaultValue, ...remainingDimensions);
    }
    return newArray;
}

// Global variables to hold the final result grid and the source character grid.
let finalResultGrid;
let inputCharGrid;

// Entry point for the program execution.
console.log(processMainLogic());

/**
 * Main function to orchestrate reading input, solving the problem, and formatting output.
 * Renamed from `main`.
 * @returns {string} The formatted output string.
 */
function processMainLogic() {
    // Read grid dimensions and target hash count from input.
    const gridHeight = inputParser.extractSingleValue(); // Original `h = o.a()`
    const gridWidth = inputParser.extractSingleValue();  // Original `w = o.a()`
    const targetHashCount = inputParser.extractSingleValue(); // Original `k = o.a()`

    // Input validation: Check for valid dimensions and target count.
    if (gridHeight <= 0 || gridWidth <= 0 || targetHashCount <= 0) {
        console.warn("processMainLogic: Invalid grid dimensions or target hash count. Returning empty output.");
        return "";
    }

    // Read the source grid (character matrix) as an array of strings.
    // The `true` parameter ensures lines are returned as strings, which is necessary for `s[y3][x3] === "#"`.
    inputCharGrid = inputParser.readLinesIntoArray(gridHeight, true); // Original `s = o.r(h,1)`

    // Initialize the result grid with a default value of 1, as per original `xArray(1,h,w)`.
    finalResultGrid = createMultiDimArray(1, gridHeight, gridWidth); // Original `ans = xArray(1,h,w)`

    // Start the recursive divide-and-conquer process.
    divideAndConquerRegion(0, 0, gridHeight, gridWidth, 1, targetHashCount);

    // Format the resulting grid into a space-separated, newline-joined string.
    const formattedOutput = finalResultGrid.map(row => row.join(" ")).join("\n");
    return formattedOutput;
}

/**
 * Recursive function to divide the grid region and assign segment IDs.
 * This is the core divide-and-conquer logic, renamed from `solve`.
 * @param {number} regionRowStart - Starting row index of the current region (absolute).
 * @param {number} regionColStart - Starting column index of the current region (absolute).
 * @param {number} currentRegionHeight - Height of the current region.
 * @param {number} currentRegionWidth - Width of the current region.
 * @param {number} currentSegmentId - The base ID to assign to segments within this region.
 * @param {number} requiredHashCount - The total number of '#' characters expected in this region.
 */
function divideAndConquerRegion(regionRowStart, regionColStart, currentRegionHeight, currentRegionWidth, currentSegmentId, requiredHashCount) {
    // Guard clauses for invalid region dimensions or zero hashes required.
    if (currentRegionHeight <= 0 || currentRegionWidth <= 0 || requiredHashCount <= 0) {
        return;
    }

    // Base case: If only one hash is required in this region, fill it entirely with the current ID.
    if (requiredHashCount === 1) {
        for (let rowIdx = regionRowStart; rowIdx < regionRowStart + currentRegionHeight; rowIdx++) {
            for (let colIdx = regionColStart; colIdx < regionColStart + currentRegionWidth; colIdx++) {
                finalResultGrid[rowIdx][colIdx] = currentSegmentId;
            }
        }
        return;
    }

    // Calculate cumulative hash counts for rows and columns within the current region.
    // These arrays store prefix sums for '#' characters.
    const rowHashPrefixSums = new Array(currentRegionHeight).fill(0); // Renamed from `y2`
    const colHashPrefixSums = new Array(currentRegionWidth).fill(0); // Renamed from `x2`

    // Iterate through the current region to count '#' characters.
    // Use relative indices (0 to height/width-1) for `rowHashPrefixSums`/`colHashPrefixSums`,
    // and absolute indices for `inputCharGrid`.
    for (let rowOffset = 0; rowOffset < currentRegionHeight; rowOffset++) {
        for (let colOffset = 0; colOffset < currentRegionWidth; colOffset++) {
            if (inputCharGrid[regionRowStart + rowOffset][regionColStart + colOffset] === "#") {
                rowHashPrefixSums[rowOffset]++;
                colHashPrefixSums[colOffset]++;
            }
        }
    }

    // Compute prefix sums for `rowHashPrefixSums`.
    for (let i = 1; i < currentRegionHeight; i++) {
        rowHashPrefixSums[i] += rowHashPrefixSums[i - 1];
    }
    // Compute prefix sums for `colHashPrefixSums`.
    for (let i = 1; i < currentRegionWidth; i++) {
        colHashPrefixSums[i] += colHashPrefixSums[i - 1];
    }

    // If the region has only one column, a vertical split is impossible. Force a horizontal split.
    // This handles the original `if(x + 1 === w)` condition.
    if (currentRegionWidth === 1) {
        handleHorizontalSplit(regionRowStart, regionColStart, currentRegionHeight, currentRegionWidth, currentSegmentId, requiredHashCount, rowHashPrefixSums);
        return;
    }

    // Attempt a vertical split (divide by column).
    // Calculate an initial midpoint for the vertical split offset (0-indexed relative to regionColStart).
    let verticalSplitOffset = Math.floor(currentRegionWidth / 2);

    // Adjust `verticalSplitOffset` if no hashes are found up to the initial split point.
    // This corresponds to the first `if(x2[xf] === 0)` block in the original `solve`.
    if (colHashPrefixSums[verticalSplitOffset] === 0) {
        let actualSplitPointCandidate = -1; // -1 indicates no suitable split point found yet.
        for (let i = verticalSplitOffset + 1; i < currentRegionWidth; i++) {
            if (colHashPrefixSums[i] > 0) { // Found the first column (offset) with hashes.
                actualSplitPointCandidate = i;
                break;
            }
        }
        // If no hashes found after the initial split point, or all hashes are contained
        // within a single block from the found split point onwards, then a vertical split
        // is not meaningful. Fallback to horizontal split.
        if (actualSplitPointCandidate === -1 || colHashPrefixSums[actualSplitPointCandidate] === requiredHashCount) {
            handleHorizontalSplit(regionRowStart, regionColStart, currentRegionHeight, currentRegionWidth, currentSegmentId, requiredHashCount, rowHashPrefixSums);
            return;
        }
        verticalSplitOffset = actualSplitPointCandidate; // Use the adjusted split point.
    }
    // Adjust `verticalSplitOffset` if all hashes are found up to the initial split point.
    // This corresponds to the `else if(x2[xf] === k)` block in the original `solve`.
    else if (colHashPrefixSums[verticalSplitOffset] === requiredHashCount) {
        let actualSplitPointCandidate = verticalSplitOffset; // Start from current offset.
        for (let i = verticalSplitOffset - 1; i >= 0; i--) {
            if (colHashPrefixSums[i] < requiredHashCount) {
                break; // Found the point where not all hashes were accumulated yet.
            }
            actualSplitPointCandidate = i; // Keep moving left as long as all hashes are accounted for.
        }
        // If all hashes were found from the very first column (i.e., `colHashPrefixSums[0] === requiredHashCount`),
        // or if `colHashPrefixSums[actualSplitPointCandidate]` is still `requiredHashCount` (meaning all hashes are in the first part),
        // or if it's 0 (no hashes at all), then this vertical split is not useful. Fallback to horizontal.
        if (colHashPrefixSums[actualSplitPointCandidate] === 0 || colHashPrefixSums[actualSplitPointCandidate] === requiredHashCount) {
            handleHorizontalSplit(regionRowStart, regionColStart, currentRegionHeight, currentRegionWidth, currentSegmentId, requiredHashCount, rowHashPrefixSums);
            return;
        }
        verticalSplitOffset = actualSplitPointCandidate; // Use the adjusted split point.
    }

    // Now `verticalSplitOffset` is the 0-indexed column offset (relative to `regionColStart`)
    // that defines the end of the first segment. The split occurs AFTER this column.
    const firstSegmentColCount = verticalSplitOffset + 1;
    const firstSegmentHashes = colHashPrefixSums[verticalSplitOffset];

    // Recursive calls for the two vertically split sub-regions.
    divideAndConquerRegion(
        regionRowStart,
        regionColStart,
        currentRegionHeight,
        firstSegmentColCount,
        currentSegmentId,
        firstSegmentHashes
    );
    divideAndConquerRegion(
        regionRowStart,
        currentCol + firstSegmentColCount, // Start of second segment
        currentRegionHeight,
        currentRegionWidth - firstSegmentColCount, // Width of second segment
        currentSegmentId + firstSegmentHashes, // New ID for the second segment
        requiredHashCount - firstSegmentHashes
    );
}

/**
 * Helper function to handle horizontal splitting of a region.
 * This is called when a vertical split is not feasible or optimal. Renamed from `f`.
 * @param {number} regionRowStart - Starting row index of the current region (absolute).
 * @param {number} regionColStart - Starting column index of the current region (absolute).
 * @param {number} currentRegionHeight - Height of the current region.
 * @param {number} currentRegionWidth - Width of the current region.
 * @param {number} currentSegmentId - The base ID to assign to segments within this region.
 * @param {number} requiredHashCount - The total number of '#' characters expected in this region.
 * @param {Array<number>} rowHashPrefixSums - Pre-calculated prefix sums of hashes per row for the current region.
 */
function handleHorizontalSplit(regionRowStart, regionColStart, currentRegionHeight, currentRegionWidth, currentSegmentId, requiredHashCount, rowHashPrefixSums) {
    // Guard clauses for invalid region height or zero hashes required.
    if (currentRegionHeight <= 0 || requiredHashCount <= 0) {
        return;
    }

    // Calculate an initial midpoint for the horizontal split offset (0-indexed relative to regionRowStart).
    let horizontalSplitOffset = Math.floor(currentRegionHeight / 2);

    // Adjust `horizontalSplitOffset` if no hashes are found up to the initial split point.
    if (rowHashPrefixSums[horizontalSplitOffset] === 0) {
        let actualSplitPointCandidate = -1;
        for (let i = horizontalSplitOffset + 1; i < currentRegionHeight; i++) {
            if (rowHashPrefixSums[i] > 0) {
                actualSplitPointCandidate = i;
                break;
            }
        }
        // If no hashes found after the initial split point, or all hashes are in one block,
        // then this split is not meaningful. Fill the entire region if hashes are expected.
        if (actualSplitPointCandidate === -1 || rowHashPrefixSums[actualSplitPointCandidate] === requiredHashCount) {
             if (requiredHashCount > 0) {
                for (let r = regionRowStart; r < regionRowStart + currentRegionHeight; r++) {
                    for (let c = regionColStart; c < regionColStart + currentRegionWidth; c++) {
                        finalResultGrid[r][c] = currentSegmentId;
                    }
                }
             }
             return;
        }
        horizontalSplitOffset = actualSplitPointCandidate;
    }
    // Adjust `horizontalSplitOffset` if all hashes are found up to the initial split point.
    else if (rowHashPrefixSums[horizontalSplitOffset] === requiredHashCount) {
        let actualSplitPointCandidate = horizontalSplitOffset;
        for (let i = horizontalSplitOffset - 1; i >= 0; i--) {
            if (rowHashPrefixSums[i] < requiredHashCount) {
                break;
            }
            actualSplitPointCandidate = i;
        }
        // Similar fallback if the split is not meaningful.
        if (rowHashPrefixSums[actualSplitPointCandidate] === 0 || rowHashPrefixSums[actualSplitPointCandidate] === requiredHashCount) {
            if (requiredHashCount > 0) {
                for (let r = regionRowStart; r < regionRowStart + currentRegionHeight; r++) {
                    for (let c = regionColStart; c < regionColStart + currentRegionWidth; c++) {
                        finalResultGrid[r][c] = currentSegmentId;
                    }
                }
            }
            return;
        }
        horizontalSplitOffset = actualSplitPointCandidate;
    }

    // Now `horizontalSplitOffset` is the 0-indexed row offset (relative to `regionRowStart`)
    // that defines the end of the first segment. The split occurs AFTER this row.
    const firstSegmentRowCount = horizontalSplitOffset + 1;
    const firstSegmentHashes = rowHashPrefixSums[horizontalSplitOffset];

    // Recursive calls for the two horizontally split sub-regions.
    divideAndConquerRegion(
        regionRowStart,
        regionColStart,
        firstSegmentRowCount,
        currentRegionWidth,
        currentSegmentId,
        firstSegmentHashes
    );
    divideAndConquerRegion(
        regionRowStart + firstSegmentRowCount, // Start of second segment
        regionColStart,
        currentRegionHeight - firstSegmentRowCount, // Height of second segment
        currentRegionWidth,
        currentSegmentId + firstSegmentHashes, // New ID for the second segment
        requiredHashCount - firstSegmentHashes
    );
}