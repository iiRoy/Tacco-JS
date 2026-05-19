var logOutput = console.log; // Custom logging function, similar to Python's print
var sourceLines; // Global variable to hold processed input lines

/**
 * Initializes the input processing mechanism.
 * Splits the raw input string into an array of lines.
 * @param {string} rawData - The complete input string.
 * @returns {function(): string} A function that returns the next line from the input.
 */
function processInputData(rawData) {
    sourceLines = rawData.split("\n"); // Divide the input into individual lines
    return function () {
        return sourceLines.shift(); // Retrieve and remove the first line
    };
}

/**
 * Parses a line of space-separated integers.
 * @param {boolean} adjustForZeroIndex - If true, subtracts 1 from each parsed integer.
 * @returns {number[]} An array of parsed integers.
 */
function parseLineOfIntegers(adjustForZeroIndex) {
    var strParts = sourceLines.shift().split(' '); // Get a line and split by space
    var indexAdjustment = adjustForZeroIndex ? -1 : 0; // Determine if adjustment is needed
    var resultArray = []; // Initialize array for results
    for (var idx = 0; idx < strParts.length; idx++) {
        resultArray.push(parseInt(strParts[idx])); // Parse and add to array
    }
    return resultArray;
}

/**
 * Finds the maximum value among its arguments.
 * @returns {number} The largest value.
 */
function findMaximum() {
    var maximumValue = arguments[0]; // Start with the first argument
    for (var idx = 1; idx < arguments.length; idx++) {
        maximumValue = maximumValue > arguments[idx] ? maximumValue : arguments[idx]; // Update if current is larger
    }
    return maximumValue;
}

/**
 * Finds the minimum value among its arguments.
 * @returns {number} The smallest value.
 */
function findMinimum() {
    var minimumValue = arguments[0]; // Start with the first argument
    for (var idx = 1; idx < arguments.length; idx++) {
        minimumValue = minimumValue < arguments[idx] ? minimumValue : arguments[idx]; // Update if current is smaller
    }
    return minimumValue;
}


/**
 * Calculates the sum of all numeric elements in the array.
 * @return {number} The total sum.
 */
Array.prototype.SUM = function calculateArraySum() { // Renamed internal function name
    var totalValue = 0; // Accumulator for the sum
    this.forEach(function (elementItem) {
        totalValue += elementItem; // Add each element
    });
    return totalValue;
};

/**
 * Formats the array elements into a string, joined by a specified separator.
 * @return {string} The formatted string.
 */
Array.prototype.Format = function formatArrayToString(separatorChar) { // Renamed internal function name
    if (separatorChar === undefined) {
        separatorChar = " "; // Default separator is a space
    }
    return this.join(separatorChar); // Join array elements
};

/**
 * Creates a comparison function for sorting objects by a specific property.
 * @param {string} propertyKey - The name of the property to sort by.
 * @param {boolean} isDescending - If true, sort in descending order.
 * @param {function(object, object): number} [tieBreakerFunction] - A function to resolve ties.
 * @returns {function(object, object): number} A comparator function for Array.prototype.sort.
 */
function createSortComparator(propertyKey, isDescending, tieBreakerFunction) {
    var sortDirection = 1; // Default ascending
    if (isDescending) {
        sortDirection = -1; // Change to descending
    }
    return function (itemA, itemB) {
        // Compare based on the specified property
        if (itemA[propertyKey] < itemB[propertyKey]) return -1 * sortDirection;
        else if (itemA[propertyKey] > itemB[propertyKey]) return sortDirection;

        // If values are equal, use the tie-breaker function if provided
        if (tieBreakerFunction === undefined) {
            return 0; // No tie-breaker, consider them equal
        } else {
            return tieBreakerFunction(itemA, itemB); // Resolve tie with custom function
        }
    };
}

/*
 This section contains comments that are intentionally verbose or in a different language,
 to demonstrate changes in whitespace and comments without altering logic.
 The original comments were in Japanese, so these are just placeholder comments.
*/

// Main execution function that processes the input and performs the core logic.
function executeProgram(rawData) {
    var getInputLine = processInputData(rawData); // Initialize input reader
    // Loop indefinitely until a specific termination condition is met
    while (true) {
        var dimensions = parseLineOfIntegers(); // Read grid dimensions (M, N)
        if (dimensions[0] === 0) { // Check for termination condition (M=0)
            return; // Exit the program
        }
        var gridCells = []; // Array to store the grid
        // Populate the grid based on the first dimension (M)
        for (var idx = 0; idx < dimensions[0]; idx++) {
            gridCells.push(getInputLine().split("")); // Read each row and split into characters
        }
        // Define a map for movement directions based on symbols
        var directionMap = {
            ">": [1, 0], // Right movement: +1 to X, 0 to Y
            "v": [0, 1], // Down movement: 0 to X, +1 to Y
            "^": [0, -1], // Up movement: 0 to X, -1 to Y
            "<": [-1, 0]  // Left movement: -1 to X, 0 to Y
        };
        var currentX = 0, currentY = 0; // Starting coordinates (top-left)
        // Simulate movement on the grid until an exit point ('.') is reached
        while (gridCells[currentY][currentX] !== ".") {
            if (gridCells[currentY][currentX] === "a") { // Check for a loop (already visited 'a')
                logOutput("LOOP"); // Output loop detection
                return; // Terminate due to loop
            }
            var currentDirection = directionMap[gridCells[currentY][currentX]]; // Get direction vector
            gridCells[currentY][currentX] = "a"; // Mark current cell as visited to detect loops
            currentX += currentDirection[0]; // Update X coordinate
            currentY += currentDirection[1]; // Update Y coordinate
        }
        logOutput(currentX, currentY); // Output final coordinates
    }
}

// Execute the main program with input from standard input.
// The commented line below shows how to read from a local file for testing.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
// executeProgram(require("fs").readFileSync("input.txt", "utf8"));
