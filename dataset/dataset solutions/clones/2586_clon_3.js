var DataStreamProcessor = (function () {
    // Private constructor for the stream handler.
    function StreamHandler(rawInputString) {
        // Ensure input is a string and handle potential empty input gracefully.
        if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
            this.sourceLines = [];
            this.currentLineIdx = 0;
            this.currentLineTokens = []; // Buffer for tokens of the current line
            return;
        }

        this.sourceLines = rawInputString.trim().split("\n");
        this.currentLineIdx = 0;
        this.currentLineTokens = []; // Initialize token buffer
    }

    /**
     * Helper to load tokens for the current line if needed.
     * @private
     */
    StreamHandler.prototype._ensureTokensLoaded = function() {
        // If the current token buffer is empty, or we've exhausted tokens from the current line
        if (this.currentLineTokens.length === 0) {
            if (this.currentLineIdx < this.sourceLines.length) {
                // Split the current line into tokens and reverse for right-to-left popping
                this.currentLineTokens = this.sourceLines[this.currentLineIdx].split(" ").reverse();
                // We advance the line index *after* consuming all tokens from this line.
                // This ensures _ensureTokensLoaded is called only when a new line is truly needed.
            } else {
                this.currentLineTokens = []; // No more lines
            }
        }
    };

    /**
     * Retrieves a single token (number or string) from the current line, from right to left.
     * Advances to the next line if the current one is exhausted after popping.
     * @param {boolean} returnAsString If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more tokens.
     */
    StreamHandler.prototype.retrieveToken = function (returnAsString = false) {
        this._ensureTokensLoaded();

        if (this.currentLineTokens.length === 0) {
            return undefined; // No more tokens available
        }

        // Pop from the reversed array
        const token = this.currentLineTokens.pop();

        // If the current line is now empty, advance to the next line for future calls
        if (this.currentLineTokens.length === 0) {
            this.currentLineIdx++;
        }

        return returnAsString ? token : parseInt(token, 10);
    };

    /**
     * Reads the entire current line, splitting it into tokens.
     * Advances to the next line.
     * @param {boolean} returnAsString If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    StreamHandler.prototype.readLineTokens = function (returnAsString = false) {
        if (this.currentLineIdx >= this.sourceLines.length) {
            return []; // No more lines
        }

        const line = this.sourceLines[this.currentLineIdx++];
        const tokens = line.split(" ");
        this.currentLineTokens = []; // Clear token buffer as line is fully read

        return returnAsString ? tokens : tokens.map(val => parseInt(val, 10));
    };

    /**
     * Reads 'count' lines, treating each as a row in a matrix.
     * Advances the line index by 'count'.
     * @param {number} count The number of lines to read.
     * @param {boolean} returnAsString If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    StreamHandler.prototype.extractMatrix = function (count, returnAsString = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + count);
        this.currentLineIdx += count;
        this.currentLineTokens = []; // Clear token buffer

        if (returnAsString) {
            return matrixRows.map(row => row.split(" "));
        } else {
            return matrixRows.map(row => row.split(" ").map(val => parseInt(val, 10)));
        }
    };

    /**
     * Reads 'count' lines as-is, without splitting them into tokens.
     * Advances the line index by 'count'.
     * @param {number} count The number of lines to read.
     * @param {boolean} returnAsString If true, returns an array of strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    StreamHandler.prototype.fetchRawLines = function (count, returnAsString = false) {
        const rawLines = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + count);
        this.currentLineIdx += count;
        this.currentLineTokens = []; // Clear token buffer

        return returnAsString ? rawLines : rawLines.map(val => parseInt(val, 10));
    };

    /**
     * Factory function to create a new StreamHandler instance.
     * @param {string} inputString The raw input string to parse.
     * @returns {StreamHandler} A new StreamHandler instance.
     */
    function createProcessor(inputString) {
        return new StreamHandler(inputString);
    }

    return createProcessor;
})();

/**
 * Recursively initializes a multi-dimensional array with a given default value.
 * This replaces the original `eval`-based implementation with a more robust recursive approach.
 *
 * @param {*} defaultValue The value to fill the innermost elements with.
 * @param {Array<number>} dimensions An array of numbers representing the dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiArray(defaultValue, ...dimensions) {
    // If no dimensions are provided, return the default value (base case for recursion).
    if (dimensions.length === 0) {
        return defaultValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Create an array for the current dimension.
    // Each element is recursively initialized with the remaining dimensions.
    const newArray = Array(currentDimensionSize).fill(null).map(() => {
        return initializeMultiArray(defaultValue, ...remainingDimensions);
    });

    return newArray;
}

// Global variables for the problem state.
var problemSize;           // Represents 'n' in the original code, the number of elements.
var valueSequence;         // Represents 's' in the original code, the sequence of input values.
var availabilityTracker;   // Represents 'a' in the original code, tracks available combinations/states.

// Read input and execute the main solution logic.
// This is typical for competitive programming environments where input is read from stdin.
var inputReader = DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(executeSolver());

/**
 * The main entry point for solving the problem.
 * Orchestrates input reading, data preparation, and initiates the search.
 * @returns {string} "Yes" if a valid combination is found, "No" otherwise.
 */
function executeSolver() {
    // Read the problem size (n) from the input.
    problemSize = inputReader.retrieveToken();

    // Basic validation for problem size.
    if (typeof problemSize !== 'number' || problemSize <= 0 || !Number.isInteger(problemSize)) {
        console.error("Invalid or non-positive problem size provided.");
        return "No";
    }

    // Read the sequence of values (s) from the input.
    valueSequence = inputReader.readLineTokens();

    // Sort the sequence in descending order, as required by the original logic.
    valueSequence.sort((valA, valB) => valB - valA);

    // Initialize the availability tracker array.
    // Its size is 2^problemSize, and all elements are initially 0.
    const trackerCapacity = 2 ** problemSize;
    availabilityTracker = initializeMultiArray(0, trackerCapacity);

    // Mark the first state as available/visited.
    availabilityTracker[0] = 1;

    // Start the recursive search process.
    // The initial call uses the first value from the sorted sequence.
    // Each path segment is [value, current_search_index].
    const initialPathSegment = [[valueSequence[0], 1]];

    // Determine if a valid combination can be found.
    const result = findSubsetCombination(initialPathSegment);

    return result ? "Yes" : "No";
}

/**
 * Recursively explores combinations to find a specific subset sum or state.
 * This function mimics the original 'bfs' logic, which is more of a recursive backtracking search.
 *
 * @param {Array<Array<number>>} currentPathSegments An array of pairs [value, starting_search_index]
 *                                                    representing the current frontier of combinations.
 * @returns {number} 1 if a valid combination is found, 0 otherwise.
 */
function findSubsetCombination(currentPathSegments) {
    const pathLength = currentPathSegments.length;
    const trackerLimit = availabilityTracker.length;

    // Base case: If the path has grown to the full capacity of the tracker, a solution is found.
    if (pathLength === trackerLimit) {
        return 1;
    }

    // Prepare a new array for the next level of path segments.
    // Using slice() creates a shallow copy, preserving existing segments.
    const nextPathSegments = currentPathSegments.slice();

    // The search index, initialized to 1 as in the original, for iterating through `valueSequence` and `availabilityTracker`.
    let searchIndex = 1;

    // Iterate through each segment in the current path.
    for (let i = 0; i < pathLength; i++) {
        const currentSegmentValue = currentPathSegments[i][0];
        const currentSegmentStartIndex = currentPathSegments[i][1];

        // Ensure searchIndex doesn't fall behind the required start index for the current segment.
        // This maintains the "c" variable's behavior from the original code.
        if (searchIndex < currentSegmentStartIndex) {
            searchIndex = currentSegmentStartIndex;
        }

        // Search for an available position in the tracker.
        // This loop tries to find the next 'searchIndex' that satisfies the conditions.
        while (searchIndex < trackerLimit) {
            // If the current position in the tracker is already marked as available, skip it.
            if (availabilityTracker[searchIndex] === 1) {
                searchIndex++;
                continue;
            }

            // If the value from the sorted sequence at searchIndex is too small,
            // it means no further elements in the sequence will be large enough for this segment
            // (since valueSequence is sorted descending). Break this inner search.
            if (valueSequence[searchIndex] < currentSegmentValue) {
                break;
            }

            // Found a suitable position that is not yet used and meets the value requirement.
            break;
        }

        // If no suitable position was found within the tracker limit for this segment,
        // then this path cannot lead to a solution.
        if (searchIndex === trackerLimit) {
            return 0;
        }

        // Mark the found position as available in the tracker.
        availabilityTracker[searchIndex] = 1;

        // Add the new segment to the next level of path segments.
        // The new segment uses the value from `valueSequence` at `searchIndex`,
        // and the search index for the *next* iteration is incremented.
        nextPathSegments.push([valueSequence[searchIndex], ++searchIndex]);
    }

    // Recursively call the function with the newly formed and sorted path segments.
    // Sorting by value (descending) is crucial for maintaining the original logic's behavior.
    nextPathSegments.sort((segmentA, segmentB) => segmentB[0] - segmentA[0]);
    return findSubsetCombination(nextPathSegments);
}