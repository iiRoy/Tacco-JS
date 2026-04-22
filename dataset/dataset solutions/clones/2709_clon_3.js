const InputProcessor = (function() {
    /**
     * Factory function to create a new DataReader instance.
     * @param {string} sourceText - The raw input string containing all lines.
     * @returns {DataReader} A new DataReader object for parsing.
     */
    function createReader(sourceText) {
        return new DataReader(sourceText);
    }

    /**
     * DataReader constructor. Manages reading lines and tokens from the input source.
     * @param {string} rawInput - The raw string content provided to the parser.
     */
    function DataReader(rawInput) {
        // Store all input lines, filtering out any empty lines that might result from extra newlines.
        this.lines = rawInput.split(/\r?\n/).filter(line => line.trim().length > 0);
        this.lineIndex = 0; // Pointer to the current line being processed.
        this.currentTokenBuffer = []; // Buffer to hold tokens (words) from the current line.
    }

    DataReader.prototype = {
        constructor: DataReader,

        /**
         * Extracts a single token (word) from the input stream.
         * If the current line's token buffer is empty, it populates it from the next available line.
         * @param {boolean} returnAsString - If true, the token is returned as a string. Otherwise, it attempts conversion to a number.
         * @returns {string|number|undefined} The extracted token, or undefined if no more input is available.
         */
        extractValue: function(returnAsString) {
            // If the current token buffer is exhausted, try to load tokens from the next line.
            if (this.currentTokenBuffer.length === 0) {
                if (this.lineIndex >= this.lines.length) {
                    return undefined; // No more lines left to process.
                }
                // Split the current line by spaces. Filter out any empty strings
                // that might result from multiple consecutive spaces (e.g., "1  2").
                this.currentTokenBuffer = this.lines[this.lineIndex].split(" ").filter(t => t !== '');
                // Do NOT increment lineIndex here; it increments only when the buffer for this line is fully consumed.
            }

            const token = this.currentTokenBuffer.shift(); // Get the next token from the front of the buffer.

            // If the buffer is now empty, it means all tokens from this line have been consumed.
            if (this.currentTokenBuffer.length === 0) {
                this.lineIndex++; // Advance the line pointer to the next line.
            }

            // Return the token as a string or a number based on the 'returnAsString' flag.
            return returnAsString ? token : (token ? Number(token) : undefined);
        },

        /**
         * Reads an entire line from the input and splits it into an array of tokens.
         * This method consumes the current line and advances the line pointer.
         * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
         * @returns {Array<string|number>} An array of tokens from the read line.
         */
        fetchLineItems: function(asStrings) {
            if (this.lineIndex >= this.lines.length) {
                return []; // No more lines to read.
            }
            // Ensure the currentTokenBuffer is cleared as we're processing a full new line.
            this.currentTokenBuffer = []; 
            const lineTokens = this.lines[this.lineIndex++].split(" ").filter(t => t !== '');
            return asStrings ? lineTokens : lineTokens.map(val => Number(val));
        },

        /**
         * Reads a specified number of lines, splitting each into tokens, and returns them as a 2D array (matrix).
         * @param {number} count - The number of lines to read.
         * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
         */
        obtainGridData: function(count, asStrings) {
            const matrix = [];
            // Ensure the currentTokenBuffer is cleared before reading multiple full lines.
            this.currentTokenBuffer = [];
            for (let i = 0; i < count; i++) {
                if (this.lineIndex < this.lines.length) {
                    const lineTokens = this.lines[this.lineIndex++].split(" ").filter(t => t !== '');
                    matrix.push(asStrings ? lineTokens : lineTokens.map(val => Number(val)));
                } else {
                    break; // Stop if we run out of lines prematurely.
                }
            }
            return matrix;
        },

        /**
         * Reads a specified number of raw lines without splitting them into individual tokens.
         * @param {number} count - The number of lines to read.
         * @param {boolean} asStrings - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
         * @returns {Array<string|number>} An array of raw lines.
         */
        acquireLinesAsStrings: function(count, asStrings) {
            const rawLines = [];
            // Ensure the currentTokenBuffer is cleared before reading multiple full lines.
            this.currentTokenBuffer = [];
            for (let i = 0; i < count; i++) {
                if (this.lineIndex < this.lines.length) {
                    const line = this.lines[this.lineIndex++];
                    rawLines.push(asStrings ? line : Number(line));
                } else {
                    break;
                }
            }
            return rawLines;
        }
    };

    return {
        createReader: createReader
    };
})();

// Initialize the input reader by processing data from standard input.
const inputReader = InputProcessor.createReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Global state variables for the movement scenario.
let maxStepsPerTurn, targetXCoord, targetYCoord;
let currentXPos = 0, currentYPos = 0;

// Execute the main program logic and print its output.
console.log(executeMovementScenario());

/**
 * Calculates the Manhattan distance from a given point (xA, yA) to the global target (targetXCoord, targetYCoord).
 * @param {number} xA - The x-coordinate of the starting point.
 * @param {number} yA - The y-coordinate of the starting point.
 * @returns {number} The calculated Manhattan distance.
 */
function calculateManhattanDistance(xA, yA) {
    return Math.abs(xA - targetXCoord) + Math.abs(yA - targetYCoord);
}

/**
 * Performs a single movement step towards the target, utilizing the `maxStepsPerTurn` budget.
 * Movement prioritizes the X-axis first, then the Y-axis if any budget remains.
 * Updates the global `currentXPos` and `currentYPos` variables.
 * @returns {string} The new coordinates formatted as a "X Y" string.
 */
function adjustPositionTowardTarget() {
    let stepBudget = maxStepsPerTurn;

    const diffX = targetXCoord - currentXPos;
    if (diffX !== 0) {
        // Determine the maximum movement along X without overshooting or exceeding budget.
        const moveXAmount = Math.min(stepBudget, Math.abs(diffX));
        currentXPos += Math.sign(diffX) * moveXAmount; // Move in the direction of the target.
        stepBudget -= moveXAmount; // Deduct used steps from the budget.
    }

    if (stepBudget > 0) {
        const diffY = targetYCoord - currentYPos;
        // Use any remaining budget to move along Y. The remaining budget is entirely spent on Y-movement.
        currentYPos += Math.sign(diffY) * stepBudget; // Move in the direction of the target.
    }

    return `${currentXPos} ${currentYPos}`;
}

/**
 * Orchestrates the entire movement scenario, determining the path from (0,0) to (targetXCoord, targetYCoord)
 * using `maxStepsPerTurn` for each move.
 * @returns {string} A newline-separated string of coordinates representing the entire calculated path.
 */
function executeMovementScenario() {
    // Read the initial parameters from the input stream.
    maxStepsPerTurn = inputReader.extractValue();
    targetXCoord = inputReader.extractValue();
    targetYCoord = inputReader.extractValue();

    // Guard clause: If the target is already (0,0), no movement is needed.
    if (targetXCoord === 0 && targetYCoord === 0) {
        return "0"; // Return "0" to indicate zero steps, consistent with string output.
    }

    // Guard clause: Check for impossibility due to parity mismatch.
    // If the step size (`maxStepsPerTurn`) is even, the parity of the Manhattan distance
    // from origin (x+y) cannot change. If (targetXCoord + targetYCoord) is odd, it's unreachable.
    if (maxStepsPerTurn % 2 === 0 && (targetXCoord + targetYCoord) % 2 !== 0) {
        return "-1"; // Indicate an impossible scenario.
    }

    const movementPathLog = [];
    let currentManhattanDistance = calculateManhattanDistance(currentXPos, currentYPos);

    // Handle an initial correction step if the total distance is not a perfect multiple of `maxStepsPerTurn`.
    if (currentManhattanDistance % maxStepsPerTurn !== 0) {
        let remainingDistanceModuloStep = currentManhattanDistance % maxStepsPerTurn;

        // If the remainder is odd, perform one standard `adjustPositionTowardTarget` step.
        // This helps align the parity for the subsequent complex adjustment step.
        if (remainingDistanceModuloStep % 2 !== 0) {
            movementPathLog.push(adjustPositionTowardTarget());
            // Recalculate distance after this initial adjustment.
            currentManhattanDistance = calculateManhattanDistance(currentXPos, currentYPos);
            remainingDistanceModuloStep = currentManhattanDistance % maxStepsPerTurn;
        }

        // Calculate the magnitudes for the two components of this special first step.
        // This step aims to strategically position `currentXPos` and `currentYPos`
        // such that all subsequent moves can be simple `adjustPositionTowardTarget` calls.
        let primaryStepComponent = Math.floor(remainingDistanceModuloStep / 2);
        
        // Apply a specific adjustment if `maxStepsPerTurn` is an even number.
        // This specific logic `if(k%2 === 0)l = k-l;` was in the original code.
        if (maxStepsPerTurn % 2 === 0) {
            primaryStepComponent = maxStepsPerTurn - primaryStepComponent;
        }
        let secondaryStepComponent = maxStepsPerTurn - primaryStepComponent;

        // Determine which axis receives the `primaryStepComponent` and which receives the `secondaryStepComponent`.
        // This choice is based on whether moving along X by `primaryStepComponent` would overshoot the target X.
        const absDiffX = Math.abs(currentXPos - targetXCoord);

        if (absDiffX >= primaryStepComponent) {
            // Move along the X-axis towards the target.
            currentXPos += Math.sign(targetXCoord - currentXPos) * primaryStepComponent;
            // Move along the Y-axis *away* from the target.
            currentYPos += Math.sign(currentYPos - targetYCoord) * secondaryStepComponent;
        } else {
            // Move along the Y-axis towards the target.
            currentYPos += Math.sign(targetYCoord - currentYPos) * primaryStepComponent;
            // Move along the X-axis *away* from the target.
            currentXPos += Math.sign(currentXPos - targetXCoord) * secondaryStepComponent;
        }
        movementPathLog.push(`${currentXPos} ${currentYPos}`);
    }

    // After potential initial adjustments, continue taking full steps until the target is reached.
    while (calculateManhattanDistance(currentXPos, currentYPos) > 0) {
        movementPathLog.push(adjustPositionTowardTarget());
    }

    // Output the total number of steps taken to reach the target.
    console.log(movementPathLog.length);
    // Return the sequence of coordinates, each on a new line.
    return movementPathLog.join("\n");
}