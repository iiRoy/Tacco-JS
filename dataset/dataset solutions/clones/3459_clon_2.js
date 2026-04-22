"use strict"; // Enforce strict mode for cleaner code execution.

// Time of generation: 08:15 AM
/**
 * Utility class to process string input line by line and token by token.
 * It handles splitting input into segments and converting them to numbers.
 */
function DataStreamReader(sourceText, typeConverter) {
    // Split the entire source text into an array of lines.
    this._sourceSegments = sourceText.split("\n");
    // Initialize the current segment (token) position within the current line.
    this._segmentPosition = 0;
    // Initialize the current line index being processed.
    this._lineCounter = 0;
    // Set the function used to convert extracted tokens, defaulting to Number.
    this._valueConverter = typeConverter || Number;
}

/**
 * Fetches the next single data atom (token) from the input stream.
 * Advances the internal pointers accordingly.
 * @returns {any} The converted data atom, or undefined if no more data.
 */
DataStreamReader.prototype.fetchNextAtom = function () {
    // Get the current line from the source segments.
    var currentLine = this._sourceSegments[this._lineCounter];
    // If there's no current line, return nothing.
    if (!currentLine) {
        return;
    }

    // Trim whitespace and split the line into tokens.
    var lineTokens = currentLine.trim().split(" ");
    // Extract the atom at the current segment position.
    var fetchedAtom = lineTokens[this._segmentPosition];
    // Advance the segment position.
    this._segmentPosition++;

    // Check if all tokens in the current line have been consumed.
    if (lineTokens.length === this._segmentPosition) {
        // Reset segment position for the next line.
        this._segmentPosition = 0;
        // Advance to the next line.
        this._lineCounter++;
    }
    // Convert and return the fetched atom.
    return this._valueConverter(fetchedAtom);
};

/**
 * Extracts all tokens from the current line as an array.
 * Advances the line counter.
 * @returns {Array<any>} An array of converted tokens from the current line.
 */
DataStreamReader.prototype.extractLineTokens = function () {
    // Retrieve the current line from the source segments.
    var activeLine = this._sourceSegments[this._lineCounter];
    // If the line is empty or non-existent, return early.
    if (!activeLine) {
        return;
    }

    // Reset the segment position as we're consuming the whole line.
    this._segmentPosition = 0;
    // Advance to the next line after processing this one.
    this._lineCounter++;
    // Split the line into tokens and map them using the value converter.
    return activeLine.split(" ").map(this._valueConverter);
};

/**
 * Recursively initializes a multi-dimensional array (grid) with a default value.
 * @param {Array<number>} dimensions - An array specifying the size of each dimension.
 * @param {any} defaultValue - The initial value to fill the grid cells with.
 * @returns {Array<any>} The initialized multi-dimensional array.
 */
function initializeGrid(dimensions, defaultValue) {
    // Start with the default value; this will be the innermost element.
    let currentLayer = defaultValue || 0;

    // Iterate backwards through the dimensions to build the array from inside out.
    for (let currentDim = dimensions.length; currentDim > 0; currentDim--) {
        // Get the size for the current dimension.
        const dimSize = dimensions[currentDim - 1];
        // Create an array of 'dimSize' and fill it with copies of the currentLayer.
        // JSON.parse(JSON.stringify()) is used for deep cloning objects/arrays,
        // ensuring independent sub-arrays/objects for each cell.
        currentLayer = Array(dimSize).fill().map(() => JSON.parse(JSON.stringify(currentLayer)));
    }
    return currentLayer;
}

// A large prime number used for modulo operations to prevent integer overflow.
const resultModulus = 1000000007;

/**
 * The primary function that orchestrates the solution logic.
 * It reads input, performs calculations, and outputs the result.
 * @param {string} inputData - The raw input string provided to the program.
 */
function orchestrateSolution(inputData) {
    // Create a new data stream reader instance to parse the input.
    var dataProcessor = new DataStreamReader(inputData);

    // Read the grid dimensions and target column from the input.
    var rowCount = dataProcessor.fetchNextAtom();
    var columnCount = dataProcessor.fetchNextAtom();
    var targetColumnIndex = dataProcessor.fetchNextAtom();

    // Pre-defined sequence of combination factors (similar to Fibonacci numbers).
    var combinationFactors = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    // Initialize the dynamic programming table (pathCounts grid) with zeros.
    var pathCounts = initializeGrid([rowCount, columnCount], 0);

    // Set initial values for the first row of the DP table based on combination factors.
    // These represent base cases for reaching specific columns in the first row.
    pathCounts[0][0] = combinationFactors[columnCount - 1];
    pathCounts[0][1] = combinationFactors[columnCount - 2];

    // Iterate through each row starting from the second row.
    for (var currentRow = 1; currentRow < rowCount; currentRow++) {
        // Iterate through each column in the current row.
        for (var currentColumn = 0; currentColumn < columnCount; currentColumn++) {
            // Calculate paths coming from the same column in the previous row.
            pathCounts[currentRow][currentColumn] += pathCounts[currentRow - 1][currentColumn] * (combinationFactors[columnCount - currentColumn - 1] * combinationFactors[currentColumn]);

            // If a left neighbor exists, calculate paths coming from the left column in the previous row.
            if (currentColumn - 1 >= 0) {
                pathCounts[currentRow][currentColumn] += pathCounts[currentRow - 1][currentColumn - 1] * (combinationFactors[columnCount - currentColumn - 1] * combinationFactors[currentColumn - 1]);
            }
            // If a right neighbor exists, calculate paths coming from the right column in the previous row.
            if (currentColumn + 1 <= columnCount - 1) {
                pathCounts[currentRow][currentColumn] += pathCounts[currentRow - 1][currentColumn + 1] * (combinationFactors[columnCount - currentColumn - 2] * combinationFactors[currentColumn]);
            }

            // Apply modulo operation to keep numbers within bounds.
            pathCounts[currentRow][currentColumn] %= resultModulus;
        }
    }

    // Output the final computed value at the target cell.
    console.log(pathCounts[rowCount - 1][targetColumnIndex - 1]);
}


// Execute the main solution function by reading input from standard input.
orchestrateSolution(require("fs").readFileSync("/dev/stdin", "utf8"));