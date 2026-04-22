const fileSystem = require("fs");

// Custom Error Class for when input runs out
class NoMoreInputError extends Error {
    constructor(message = "End of input stream reached. No further elements available.") {
        super(message);
        this.name = "NoMoreInputError";
    }
}

// Custom Error Class for unsupported conversion types
class InvalidConversionTypeError extends Error {
    constructor(message = "Provided conversion type is not recognized or supported.") {
        super(message);
        this.name = "InvalidConversionTypeError";
    }
}

// Class to manage and iterate over input lines
class InputLineStream {
    #dataSegments; // Private field for input lines
    #currentReadIndex; // Private field for current position

    constructor(inputContent) {
        // Ensure inputContent is a string, then split into lines, filtering out empty ones
        if (typeof inputContent !== 'string') {
            throw new TypeError("InputLineStream expects a string content for initialization.");
        }
        this.#dataSegments = inputContent.split("\n").map(s => s.trim()).filter(s => s.length > 0);
        this.#currentReadIndex = 0;
    }

    // Retrieves the next line from the stream
    getNextLine() {
        if (!this.hasMoreLines()) {
            throw new NoMoreInputError();
        }
        const lineToReturn = this.#dataSegments[this.#currentReadIndex];
        this.#currentReadIndex++;
        return lineToReturn;
    }

    // Checks if there are more lines available in the stream
    hasMoreLines() {
        return this.#currentReadIndex < this.#dataSegments.length;
    }
}

// Global instance of the input stream handler
// Reads from /dev/stdin by default, or from a file specified as a command-line argument
const rawFileContent = fileSystem.readFileSync(process.argv[2] || "/dev/stdin", "utf8");
const inputHandler = new InputLineStream(rawFileContent);

// --- Global Utility Functions (Wrapper for the InputLineStream and Output) ---

/**
 * Fetches the next available input line.
 * @returns {string} The next line.
 * @throws {NoMoreInputError} If no more lines are available.
 */
const retrieveNextEntry = () => inputHandler.getNextLine();

/**
 * Checks if there are more input lines to process.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
const checkIfMoreEntriesExist = () => inputHandler.hasMoreLines();

/**
 * Displays a message to the standard output.
 * @param {any} content The content to display.
 */
const renderOutput = (content) => console.log(content);

/**
 * Logs an error or debug message to the standard error stream.
 * @param {any} debugMessage The message to log.
 */
const recordDebugInfo = (debugMessage) => console.error(debugMessage);

// --- Input Transformation Function ---

/**
 * Transforms an input string based on a specified conversion type.
 * @param {string} inputString The string to convert.
 * @param {number} conversionRule The rule to apply (4 for space-separated numbers, 6 for character array).
 * @returns {number[] | string[]} The converted value.
 * @throws {InvalidConversionTypeError} If the conversion rule is not supported.
 */
function applyStringTransformation(inputString, conversionRule) {
    try {
        switch (conversionRule) {
            case 4: // Split by space and convert to array of numbers
                return inputString.split(" ").map(s => parseInt(s, 10));
            case 6: // Split into array of characters
                return inputString.split("");
            default:
                throw new InvalidConversionTypeError(`Conversion rule '${conversionRule}' is not a valid operation.`);
        }
    } catch (conversionError) {
        // Re-throw or log specific error if needed
        recordDebugInfo(`Error during string transformation: ${conversionError.message}`);
        throw conversionError; // Propagate the error
    }
}

// --- Main Application Logic ---

/**
 * Solves a pathfinding problem on a grid by navigating backwards from destination to origin.
 * The pathfinding rule is specific: from a cell (y, x), one can only move to (y-1, x) or (y, x-1).
 * If both previous cells are path cells ('.'), or both are wall cells ('#'), the path is considered impossible.
 * If exactly one of the previous cells is a path cell, the path must take that route.
 */
function tracePathInGrid() {
    // Read the grid dimensions (Height and Width)
    const dimensionsInput = applyStringTransformation(retrieveNextEntry(), 4);
    const gridHeight = dimensionsInput[0];
    const gridWidth = dimensionsInput[1];

    // Initialize the grid structure
    const gridLayout = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        gridLayout.push(applyStringTransformation(retrieveNextEntry(), 6));
    }

    // Helper functions for grid interaction
    const isWithinBounds = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
    const isWallSegment = (r, c) => isWithinBounds(r, c) && gridLayout[r][c] === '#';
    const isPathSegment = (r, c) => isWithinBounds(r, c) && gridLayout[r][c] === '.';
    const isOriginPoint = (r, c) => r === 0 && c === 0;

    // Start tracing from the bottom-right corner (destination)
    let currentYCoordinate = gridHeight - 1;
    let currentXCoordinate = gridWidth - 1;
    let pathTraversalSteps = 0; // Keep track of steps (added intermediate variable)

    // Loop until the origin (0,0) is reached
    while (!isOriginPoint(currentYCoordinate, currentXCoordinate)) {
        // recordDebugInfo(`Current Position: (${currentXCoordinate}, ${currentYCoordinate})`); // Debugging line removed

        // Handle movement at the top edge (can only move left)
        if (currentYCoordinate === 0) {
            if (isPathSegment(currentYCoordinate, currentXCoordinate - 1)) {
                currentXCoordinate--;
            } else {
                renderOutput("PATH_UNNAVIGABLE"); // Updated output message
                return;
            }
        }
        // Handle movement at the left edge (can only move up)
        else if (currentXCoordinate === 0) {
            if (isPathSegment(currentYCoordinate - 1, currentXCoordinate)) {
                currentYCoordinate--;
            } else {
                renderOutput("PATH_UNNAVIGABLE"); // Updated output message
                return;
            }
        }
        // Handle movement in the interior of the grid (can move up or left)
        else {
            const canMoveUpToPath = isPathSegment(currentYCoordinate - 1, currentXCoordinate);
            const canMoveLeftToPath = isPathSegment(currentYCoordinate, currentXCoordinate - 1);

            // If exactly one of the adjacent cells is a path, take that path
            if (canMoveUpToPath && !canMoveLeftToPath) {
                currentYCoordinate--;
            } else if (!canMoveUpToPath && canMoveLeftToPath) {
                currentXCoordinate--;
            }
            // If both are paths, or both are walls, it's an impossible scenario for this rule set
            else {
                renderOutput("PATH_UNNAVIGABLE"); // Updated output message
                return;
            }
        }
        pathTraversalSteps++; // Increment step counter
        // Optional: Add a safety break for extremely long paths to prevent infinite loops in bad data
        if (pathTraversalSteps > gridHeight * gridWidth * 2) { // Arbitrary large limit
            recordDebugInfo("Path tracing exceeded maximum steps, indicating a potential loop or very long path.");
            renderOutput("PATH_UNNAVIGABLE_LOOP_DETECTED");
            return;
        }
    }

    // If the origin (0,0) is reached, a valid path exists
    renderOutput("PATH_SUCCESSFULLY_TRACED"); // Updated output message
}

// --- Program Entry Point ---
try {
    tracePathInGrid();
} catch (executionError) {
    if (executionError instanceof NoMoreInputError) {
        recordDebugInfo(`Input processing error: ${executionError.message}`);
    } else if (executionError instanceof InvalidConversionTypeError) {
        recordDebugInfo(`Data transformation error: ${executionError.message}`);
    } else {
        recordDebugInfo(`An unexpected error occurred during program execution: ${executionError.message}`);
    }
    // Optionally, output a generic failure message to stdout
    renderOutput("PROGRAM_FAILED_DUE_TO_ERROR");
}