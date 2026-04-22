const outputLogger = console.log;

// Internal cache for processed input lines.
let inputLineCache = [];

/**
 * Prepares an input reader function from a raw string.
 * Filters out empty lines and provides a method to retrieve the next line.
 * @param {string} sourceData The raw input string, typically from a file.
 * @returns {{ getLine: () => string|undefined }} An object with a method to fetch the next line.
 * @throws {Error} If sourceData is not a valid string.
 */
function prepareInputReader(sourceData) {
    if (typeof sourceData !== 'string' || sourceData === null) {
        throw new Error("Input processing error: Provided source data is not a valid string.");
    }
    // Split by newline and filter out any lines that are just whitespace or empty.
    inputLineCache = sourceData.split('\n').map(line => line.trim()).filter(line => line !== '');
    
    return {
        getLine: function() {
            // Retrieve and remove the first line from the cache.
            return inputLineCache.shift();
        }
    };
}

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Optionally adjusts each number by subtracting 1 (useful for 0-indexed contexts).
 * @param {string} lineData The string containing space-separated numbers.
 * @param {boolean} [adjustForZeroIndex=false] If true, subtract 1 from each parsed number.
 * @returns {number[]} An array of parsed integers. Returns an empty array if lineData is invalid.
 */
function parseIntegerArray(lineData, adjustForZeroIndex = false) {
    if (typeof lineData !== 'string' || lineData.length === 0) {
        // Return an empty array for invalid or empty input lines
        return [];
    }
    
    // Split the line by spaces, filter out empty tokens, and convert to numbers.
    const tokens = lineData.split(' ').filter(token => token !== '');
    const valueAdjustment = adjustForZeroIndex ? -1 : 0;
    
    // Use Number() for conversion, which handles various string formats.
    return tokens.map(str => Number(str) + valueAdjustment);
}

/**
 * Determines the largest number among the provided arguments.
 * @param {...number} numbers Any number of numeric arguments.
 * @returns {number} The largest number.
 * @throws {Error} If no arguments are provided.
 */
function findLargest(...numbers) {
    if (numbers.length === 0) {
        throw new Error("No arguments provided to findLargest; cannot determine maximum.");
    }
    // Utilize the built-in Math.max function with spread operator for brevity.
    return Math.max(...numbers);
}

/**
 * Determines the smallest number among the provided arguments.
 * @param {...number} numbers Any number of numeric arguments.
 * @returns {number} The smallest number.
 * @throws {Error} If no arguments are provided.
 */
function findSmallest(...numbers) {
    if (numbers.length === 0) {
        throw new Error("No arguments provided to findSmallest; cannot determine minimum.");
    }
    // Utilize the built-in Math.min function with spread operator.
    return Math.min(...numbers);
}

/**
 * Calculates the sum of all numeric elements in an array.
 * This method is added to the Array prototype.
 * @returns {number} The total sum of array elements.
 */
Array.prototype.calculateSum = function calculateSum() {
    // Use reduce for a concise sum calculation, starting with an initial value of 0.
    return this.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

/**
 * Formats an array's elements into a single string, joined by a specified delimiter.
 * This method is added to the Array prototype.
 * @param {string} [delimiterString=' '] The string to place between array elements. Defaults to a space.
 * @returns {string} The formatted string.
 */
Array.prototype.formatArray = function formatArray(delimiterString = ' ') {
    // Leverage the native join method with a default parameter for the delimiter.
    return this.join(delimiterString);
};

/**
 * Generates a comparison function for sorting arrays of objects based on a specified property.
 * Supports ascending/descending order and a custom tie-breaker function.
 * @param {string|number} propertyKey The key (property name) to compare.
 * @param {boolean} [isDescending=false] If true, sort in descending order.
 * @param {(a: object, b: object) => number} [tieBreaker=(a,b)=>0] A function to resolve equality for the primary key.
 * @returns {(elementA: object, elementB: object) => number} A standard comparison function for Array.prototype.sort().
 * @throws {Error} If propertyKey is not a string or number.
 */
function createSortComparator(propertyKey, isDescending = false, tieBreaker = (elementA, elementB) => 0) {
    if (typeof propertyKey !== 'string' && typeof propertyKey !== 'number') {
        throw new Error("Comparator creation error: 'propertyKey' must be a string or number.");
    }

    const sortOrderMultiplier = isDescending ? -1 : 1; // 1 for ascending, -1 for descending

    return (elementA, elementB) => {
        const valueA = elementA[propertyKey];
        const valueB = elementB[propertyKey];

        if (valueA < valueB) {
            return -1 * sortOrderMultiplier;
        }
        if (valueA > valueB) {
            return 1 * sortOrderMultiplier;
        }
        // If primary keys are equal, apply the tie-breaker function.
        return tieBreaker(elementA, elementB);
    };
}

// --- Main Program Logic ---

/**
 * Executes the core program logic for navigating a grid based on directional characters.
 * Reads grid dimensions, then the grid itself, and simulates movement until a '.' is found
 * or a loop is detected ('a' character marks visited cells).
 * @param {string} programInput The entire input data as a single string.
 */
function executeProgramLogic(programInput) {
    // Initialize the input reader.
    const inputReader = prepareInputReader(programInput);
    // Helper to get an array of integers from the next line.
    const getNextIntArray = (adjust = false) => parseIntegerArray(inputReader.getLine(), adjust);

    // Define constants for the grid traversal.
    const traversalDirections = {
        ">": [1, 0],  // Move Right (deltaX, deltaY)
        "v": [0, 1],  // Move Down
        "^": [0, -1], // Move Up
        "<": [-1, 0]  // Move Left
    };
    const visitedMarker = 'a'; // Character to mark visited cells
    const terminalCell = '.';  // Character indicating the end point

    // Outer loop to process multiple test cases, each starting with grid dimensions.
    // Continues until the first dimension is 0.
    while (true) {
        // Read grid dimensions (only the number of rows is relevant for this problem).
        const dimensions = getNextIntArray();
        const gridRows = dimensions[0]; // First element is the number of rows.

        // If the number of rows is 0, it's the termination signal.
        if (gridRows === 0) {
            break; // Exit the main program loop.
        }

        // Initialize the grid matrix.
        const gridMatrix = [];
        for (let rowIdx = 0; rowIdx < gridRows; rowIdx++) {
            // Read each row as a string and convert it to an array of characters.
            const rowString = inputReader.getLine();
            if (rowString === undefined) {
                outputLogger("ERROR: Incomplete input for grid matrix.");
                return;
            }
            gridMatrix.push(Array.from(rowString));
        }

        // Initialize current position at (0,0).
        let currentXPosition = 0;
        let currentYPosition = 0;
        let stepCount = 0;
        const maxAllowedSteps = 10000; // Safety guard for extremely large or erroneous grids.

        // Inner loop for simulating movement within the current grid.
        // Continues until the current cell is the terminal cell ('.').
        while (gridMatrix[currentYPosition][currentXPosition] !== terminalCell) {
            // Safety check to prevent infinite loops in case of unexpected input or logic errors.
            if (stepCount++ > maxAllowedSteps) {
                outputLogger("ERROR: Maximum allowed steps exceeded. Possible infinite loop detected.");
                return;
            }

            const cellContent = gridMatrix[currentYPosition][currentXPosition];

            // Check if we've already visited this cell in the current traversal (loop detection).
            if (cellContent === visitedMarker) {
                outputLogger("LOOP DETECTED");
                return; // Terminate execution for this test case.
            }

            // Retrieve movement vector based on the character in the current cell.
            const movementVector = traversalDirections[cellContent];
            if (!movementVector) {
                outputLogger(`ERROR: Invalid direction character '${cellContent}' at (${currentXPosition}, ${currentYPosition}).`);
                return;
            }

            // Mark the current cell as visited before moving.
            gridMatrix[currentYPosition][currentXPosition] = visitedMarker;

            // Update position.
            currentXPosition += movementVector[0];
            currentYPosition += movementVector[1];

            // Basic boundary check to prevent out-of-bounds access.
            if (currentYPosition < 0 || currentYPosition >= gridMatrix.length ||
                currentXPosition < 0 || currentXPosition >= gridMatrix[0].length) {
                outputLogger("ERROR: Movement resulted in out-of-bounds position.");
                return;
            }
        }
        // If the loop terminates, it means the terminalCell '.' was reached.
        outputLogger(`Final position: ${currentXPosition} ${currentYPosition}`);
    }
}

// --- Program Entry Point ---
(function runMain() {
    try {
        // Check if running in a Node.js-like environment with file system access.
        if (typeof require === 'function' && require.main === module) {
            // Attempt to read from /dev/stdin for competitive programming environments.
            const fileSystem = require("fs");
            const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
            executeProgramLogic(inputData);
        } else {
            // Fallback for environments where direct file reading isn't available or for testing.
            // A placeholder for manual input if needed.
            outputLogger("Warning: Not running in standard Node.js environment or input file not specified.");
            // Example of how to call with a string if not reading from stdin:
            // executeProgramLogic("2 2\n>v\n.<\n0");
        }
    } catch (error) {
        outputLogger(`An unexpected error occurred: ${error.message}`);
        // Optionally log stack trace for debugging.
        // outputLogger(error.stack);
    }
})();