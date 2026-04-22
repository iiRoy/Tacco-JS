let outputLog = console.info; // Mimics Python's print function for convenience
let sourceLines; // Stores processed input lines for sequential access

function acquireTextData(rawData) { // Function to parse and prepare raw input string
    sourceLines = rawData.split('\n');
    return function() { // Returns a closure to retrieve lines one by one
        return sourceLines.shift();
    };
}

function parseIntegersFromLine(adjustForZeroIndex) { // Parses a line of space-separated numbers into an array
    const stringParts = sourceLines.shift().split(' ');
    const valueCorrection = adjustForZeroIndex ? -1 : 0; // Determines if values need adjustment (e.g., for 1-based indexing)
    const resultArray = [];
    for (let idx = 0; idx < stringParts.length; idx++) {
        resultArray.push(Number.parseInt(stringParts[idx]));
    }
    return resultArray;
}

function findMaximum() { // Finds the largest value among its arguments
    let currentMax = arguments[0];
    for (let counter = 1; counter < arguments.length; counter++) {
        currentMax = currentMax > arguments[counter] ? currentMax : arguments[counter];
    }
    return currentMax;
}

function findMinimum() { // Finds the smallest value among its arguments
    let currentMin = arguments[0];
    for (let jdx = 1; jdx < arguments.length; jdx++) {
        currentMin = currentMin < arguments[jdx] ? currentMin : arguments[jdx];
    }
    return currentMin;
}


/**
 * Computes the sum of all numeric elements in the array.
 * @returns {number} The total sum of elements.
 */
Array.prototype.calculateTotal = function sumElements() {
    let accumulator = 0;
    this.forEach(function (elementValue) {
        accumulator += elementValue;
    });
    return accumulator;
};

/**
 * Converts array elements to a string, joined by a specified separator.
 * @param {string} [separatorChar=" "] - The string to use as a separator between elements.
 * @returns {string} The concatenated string representation of the array.
 */
Array.prototype.stringifyElements = function formatElements(separatorChar) {
    if (separatorChar === void 0) { // Check if separator is not explicitly provided
        separatorChar = " ";
    }
    return this.join(separatorChar);
};

function createSortComparator(propertyKey, isDescending, tieBreakerFunction) { // Generates a comparison function for sorting objects by a specific property
    let orderDirection = 1;
    if (isDescending) { // Adjusts comparison direction for descending order
        orderDirection = -1;
    }
    return function(firstItem, secondItem) { // The actual comparison logic for two objects
        if (firstItem[propertyKey] < secondItem[propertyKey]) return -1 * orderDirection;
        else if (firstItem[propertyKey] > secondItem[propertyKey]) return orderDirection;

        if (tieBreakerFunction === null) { // If no tie-breaker is provided, consider them equal
            return 0;
        } else {
            return tieBreakerFunction(firstItem, secondItem); // Use the provided tie-breaker function
        }
    };
}

/*
 * This section contains placeholder comments,
 * typically used for extensive documentation or
 * multi-line notes about the overall program structure
 * or complex algorithms. It helps in understanding
 * the high-level design choices.
 */

// This function is the primary entry point for processing the problem input.
function executeProgram(initialData) { // Orchestrates the main execution flow of the application
    const getNextLine = acquireTextData(initialData); // Function to read lines sequentially from the pre-processed input
    while (true) { // Infinite loop, designed to break on a specific termination condition
        const dims = parseIntegersFromLine(); // Reads dimensions (e.g., width, height) from the current input line
        if (dims[0] === 0) { // Termination condition: if the first dimension is zero, exit the program
            return;
        }
        const gridCells = []; // Initializes a 2D array (grid) to store cell data
        for (let rowIdx = 0; rowIdx < dims[0]; rowIdx++) {
            gridCells.push(getNextLine().split('')); // Populates the grid row by row by splitting the input line into characters
        }
        const directionMap = { // Defines movement vectors (dx, dy) for different directional symbols
            ">": [1, 0],
            "v": [0, 1],
            "^": [0, -1],
            "<": [-1, 0]
        };
        let currentX = 0,
            currentY = 0; // Starting coordinates for the traversal within the grid
        while (gridCells[currentY][currentX] !== '.') { // Traverses the grid until an exit point ('.') is found
            if (gridCells[currentY][currentX] === 'visited') { // Detects if a cycle has occurred by re-visiting a marked cell
                outputLog("CYCLE_DETECTED"); // Logs a cycle detection message
                return; // Exits the program due to cycle
            }
            const movementVector = directionMap[gridCells[currentY][currentX]]; // Gets the movement vector based on the symbol in the current cell
            gridCells[currentY][currentX] = 'visited'; // Marks the current cell as visited to detect future cycles
            currentX += movementVector[0]; // Updates the X coordinate based on the movement vector
            currentY += movementVector[1]; // Updates the Y coordinate based on the movement vector
        }
        outputLog(currentX, currentY); // Logs the final coordinates when an exit point is reached
    }
}

// This is the primary invocation point, reading input from standard input and starting the program.
executeProgram(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
// executeProgram(require('node:fs').readFileSync('sample.txt', 'utf8')); // Example for local file testing with a custom input file