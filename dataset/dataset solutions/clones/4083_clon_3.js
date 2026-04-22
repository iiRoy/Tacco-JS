const InputDataParser = (function () {
    /**
     * Factory function to create a new input reader instance.
     * It initializes an InputSourceHandler with the provided raw string content.
     * @param {string} rawInputString - The complete string content to be parsed, typically from a file.
     * @returns {InputSourceHandler} An instance of the input source handler.
     */
    function createReaderInstance(rawInputString) {
        return new InputSourceHandler(rawInputString);
    }

    /**
     * @class InputSourceHandler
     * @description Manages the parsing and sequential reading of input lines.
     * Stores input as an array of lines and maintains a cursor to track the current reading position.
     * Provides methods to extract different types of data from the stream.
     */
    function InputSourceHandler(initialStringContent) {
        // Pre-process the input string: trim leading/trailing whitespace and split into individual lines.
        // If the input is empty or not a string, initialize with an empty array to ensure safe operations.
        this.sourceLines = (typeof initialStringContent === 'string' && initialStringContent.trim().length > 0)
            ? initialStringContent.trim().split("\n")
            : [];
        // This zero-based index points to the next line that will be processed.
        this.currentLineIndex = 0;
        // A temporary buffer to hold tokens of the current line, avoiding repeated `split()` calls.
        this.currentLineTokens = null;
    }

    /**
     * Extracts and returns a single value from the current line.
     * This method treats the current line as a sequence of space-separated tokens.
     * It reads tokens from left to right, advancing the internal token buffer.
     * If the current line is exhausted, it moves to the next line automatically.
     * @param {boolean} [returnAsString=false] - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {(string|number|null)} The extracted value, or `null` if no more values are available in the input stream.
     */
    InputSourceHandler.prototype.extractNextItem = function (returnAsString = false) {
        const lineBuffer = this.sourceLines;
        const currentIdx = this.currentLineIndex;

        // Guard clause: Check if we have read all available lines.
        if (currentIdx >= lineBuffer.length) {
            return null; // Indicates end of input stream.
        }

        // If the token buffer for the current line is empty or not yet initialized,
        // populate it by splitting the content of the current line.
        if (!this.currentLineTokens || this.currentLineTokens.length === 0) {
            const currentLineContent = lineBuffer[currentIdx];
            // Ensure the content is a string before attempting to split.
            if (typeof currentLineContent !== 'string') {
                // If content is not a string, it's an unexpected state (e.g., null, undefined).
                // Advance the line index and recursively call to handle the next line, or return null.
                this.currentLineIndex++;
                this.currentLineTokens = null;
                return this.extractNextItem(returnAsString);
            }
            // Split the current line by spaces to get its tokens.
            this.currentLineTokens = currentLineContent.split(" ");
        }

        // Extract the first token from the buffered array and remove it.
        const valueToken = this.currentLineTokens.shift();

        // If removing the token made the buffer empty, it means the current line is fully processed.
        // Advance to the next line and clear the token buffer cache.
        if (this.currentLineTokens.length === 0) {
            this.currentLineIndex++;
            this.currentLineTokens = null;
        }

        // Return the token, either as its raw string form or as a number.
        return returnAsString ? valueToken : Number(valueToken);
    };

    /**
     * Reads an entire line of space-separated values and advances the line cursor.
     * This method is suitable for lines where all values need to be processed together.
     * @param {boolean} [returnAsStringArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<(string|number)>} An array containing the parsed values of the line. Returns an empty array if the line is invalid or empty.
     */
    InputSourceHandler.prototype.parseLine = function (returnAsStringArray = false) {
        // Retrieve the current line content and immediately advance the line cursor.
        const lineContent = this.sourceLines[this.currentLineIndex++];
        this.currentLineTokens = null; // Invalidate any cached tokens as we're moving to a new line.

        // Guard clause: Handle cases where line content is not a valid string.
        if (typeof lineContent !== 'string') {
            return []; // Return an empty array for invalid lines.
        }
        const tokens = lineContent.split(" ");
        // Map tokens to numbers if requested, otherwise return as strings.
        return returnAsStringArray ? tokens : tokens.map(str => Number(str));
    };

    /**
     * Reads a specified number of lines, parsing each into an array of values.
     * This is particularly useful for reading multi-line data structures like matrices.
     * @param {number} count - The number of lines to read and process.
     * @param {boolean} [returnAsStringMatrix=false] - If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
     * @returns {Array<Array<(string|number)>>} A 2D array representing the parsed matrix data. Returns an empty array if count is invalid.
     */
    InputSourceHandler.prototype.extractMultiLineData = function (count, returnAsStringMatrix = false) {
        // Guard clause: Ensure a positive count is provided.
        if (count <= 0) {
            return [];
        }

        const startIndex = this.currentLineIndex;
        // Calculate the actual end index, preventing reading beyond the available lines.
        const actualEndIndex = Math.min(startIndex + count, this.sourceLines.length);
        const linesToProcess = this.sourceLines.slice(startIndex, actualEndIndex);

        // Update the line cursor to reflect the lines that have just been processed.
        this.currentLineIndex = actualEndIndex;
        this.currentLineTokens = null; // Clear token cache.

        // Process each line: split into tokens and convert to numbers if required.
        const processedData = linesToProcess.map(line => {
            if (typeof line !== 'string') {
                return []; // Return an empty array for malformed lines within the block.
            }
            const tokens = line.split(" ");
            return returnAsStringMatrix ? tokens : tokens.map(str => Number(str));
        });

        return processedData;
    };

    /**
     * Fetches a specified number of raw lines without further splitting into tokens,
     * and advances the line cursor. Each line can optionally be converted to a number.
     * @param {number} count - The number of raw lines to retrieve.
     * @param {boolean} [convertEachToNumber=false] - If true, attempts to convert each fetched line to a number.
     * @returns {Array<(string|number)>} An array containing the raw line strings or their numeric equivalents. Returns an empty array if count is invalid.
     */
    InputSourceHandler.prototype.fetchRawLines = function (count, convertEachToNumber = false) {
        // Guard clause: Ensure a positive count is provided.
        if (count <= 0) {
            return [];
        }

        const startIndex = this.currentLineIndex;
        // Calculate the actual end index, preventing reading beyond the available lines.
        const actualEndIndex = Math.min(startIndex + count, this.sourceLines.length);
        const rawLines = this.sourceLines.slice(startIndex, actualEndIndex);

        // Update the line cursor.
        this.currentLineIndex = actualEndIndex;
        this.currentLineTokens = null; // Clear token cache.

        // Convert lines to numbers if requested, otherwise return as strings.
        return convertEachToNumber ? rawLines.map(line => Number(line)) : rawLines;
    };

    return createReaderInstance;
})();

// Main program execution starts here.
// The `InputDataParser` is instantiated with content read from standard input.
// This setup assumes a Node.js environment for `require("fs").readFileSync`.
const dataHandler = InputDataParser(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * The primary function that encapsulates the problem's core logic.
 * It reads trip plan details and determines if all planned movements are feasible.
 * @returns {string} "Yes" if all trips are possible, "No" otherwise.
 */
function solveTravelProblem() {
    // Read the total number of planned trips from the input stream.
    const numTrips = dataHandler.extractNextItem();

    // Input validation: If the number of trips is invalid (null, undefined, or negative),
    // it indicates malformed input, making the travel plan impossible.
    if (numTrips === null || typeof numTrips !== 'number' || isNaN(numTrips) || numTrips < 0) {
        return "No";
    }

    // Read all subsequent lines, each representing a trip's details (target time, x, y coordinates).
    // This will be a 2D array where each inner array is [time, x_coordinate, y_coordinate].
    const tripWaypoints = dataHandler.extractMultiLineData(numTrips);

    // Initialize the current state of the traveler: starting at (0,0) at time 0.
    let currentWaypointTime = 0;
    let currentWaypointX = 0;
    let currentWaypointY = 0;

    // Iterate through each planned trip to verify its feasibility.
    for (let currentTripIndex = 0; currentTripIndex < numTrips; currentTripIndex++) {
        const waypointData = tripWaypoints[currentTripIndex];

        // Deep validation for each waypoint's data structure.
        // Ensure it's an array and contains the expected three numeric values.
        if (!Array.isArray(waypointData) || waypointData.length < 3 || waypointData.some(val => typeof val !== 'number' || isNaN(val))) {
            return "No"; // Malformed trip data makes this plan impossible.
        }

        // Use array destructuring to clearly extract the target state for the current trip.
        const [targetTime, targetX, targetY] = waypointData;

        // Calculate the Manhattan distance required to travel from the current position to the target.
        const requiredSpatialDistance = Math.abs(currentWaypointX - targetX) + Math.abs(currentWaypointY - targetY);

        // Calculate the total time available for this segment of the trip.
        const timeBudget = targetTime - currentWaypointTime;

        // Feasibility check 1: Can the target be reached within the available time?
        // An object can move at most one unit of distance per unit of time.
        if (requiredSpatialDistance > timeBudget) {
            return "No";
        }

        // Feasibility check 2: Do the spatial distance and time budget have the same parity?
        // If an object moves one unit per second, the total moves (distance) and total time
        // must have the same parity. For example, to move 1 unit in 2 seconds, you'd move 1 unit
        // then 1 unit back, or 1 unit, then stand still, requiring an even number of total moves.
        // To move 1 unit in 1 second, you make 1 move (odd). If distance is odd and time is even,
        // or vice versa, it's impossible to reach the exact target at the exact time.
        if ((requiredSpatialDistance % 2) !== (timeBudget % 2)) {
            return "No";
        }

        // If both feasibility checks pass for the current trip, update the traveler's
        // current state to the target state of this trip for the next iteration.
        currentWaypointX = targetX;
        currentWaypointY = targetY;
        currentWaypointTime = targetTime;
    }

    // If the loop completes without returning "No", it means all trips are feasible.
    return "Yes";
}

// Execute the main problem-solving function and print its result to the console.
console.log(solveTravelProblem());