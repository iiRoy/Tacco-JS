// This module defines a script to process grid-filling instructions.
// It reads dimensions and segment data from standard input to construct
// a 2D matrix (grid) filled in a distinct serpentine (snake-like) pattern.

// --- Input Acquisition and Initial Parsing ---

// Utilize Node.js 'fs' module to synchronously read the entire standard input.
// The input is expected to be UTF-8 encoded. It's then trimmed of leading/trailing
// whitespace and split into an array of individual lines.
const inputLinesBuffer = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// A helper function to cast a string to a numeric type.
// Using Number() is a concise way to achieve this, similar to the original's `* 1`.
const coerceToNumber = (textValue) => Number(textValue);

// --- Grid Dimension and Segment Count Extraction ---

// Verify that sufficient input lines are available before attempting to parse.
// This acts as a basic robustness check (Type III addition).
if (inputLinesBuffer.length < 3) {
    // In a production scenario, this might throw an error or exit.
    // For this clone, we proceed, but the check itself is an addition.
}

// Extract the first line, which contains the grid's height and width, separated by spaces.
const gridDimensionTokens = inputLinesBuffer.shift().split(' ');
const totalGridRows = coerceToNumber(gridDimensionTokens.shift()); // 'H' from original
const totalGridColumns = coerceToNumber(gridDimensionTokens.shift()); // 'W' from original

// Extract the second line, which specifies the total number of segments to process.
const totalFillSegments = coerceToNumber(inputLinesBuffer.shift()); // 'N' from original

// Extract the third line, containing space-separated lengths for each segment.
const segmentLengthStrings = inputLinesBuffer.shift().split(' '); // 'a' from original

// --- Grid Structure Initialization ---

// Create the main 2D array (matrix) that will hold the filled values.
// It's initialized with the determined row and column counts.
const outputMatrix = [];
for (let rowIterator = 0; rowIterator < totalGridRows; rowIterator++) {
    // Each row is an array, initially empty (or filled with undefined implicitly).
    outputMatrix[rowIterator] = new Array(totalGridColumns);
}

// --- Serpentine Filling Algorithm ---

// Define constants for clarity in direction management (Type III addition).
const MOVE_RIGHT = 'RIGHT';
const MOVE_LEFT = 'LEFT';

let currentYCoordinate = 0; // Tracks the current row index ('h' from original)
let currentXCoordinate = 0; // Tracks the current column index ('w' from original)
let currentMovementMode = MOVE_RIGHT; // Starting direction ('m' from original)

// Iterate through each distinct segment that needs to be placed into the grid.
for (let segmentIdentifier = 0; segmentIdentifier < totalFillSegments; segmentIdentifier++) {
    // Parse the numerical length for the current segment.
    const segmentBlockLength = coerceToNumber(segmentLengthStrings[segmentIdentifier]); // 'n' from original

    // Fill cells for the current segment, one by one, according to its length.
    for (let fillStep = 0; fillStep < segmentBlockLength; fillStep++) {
        // Assign the segment's identifier (plus one, as segments are 1-indexed in output)
        // to the current cell. The original code had an `if (cell === undefined)` check
        // here, but it's redundant given the sequential filling of the snake pattern.
        // Removing it is a Type III deletion of a non-essential statement.
        outputMatrix[currentYCoordinate][currentXCoordinate] = segmentIdentifier + 1;

        // Determine the next grid position based on current direction and boundaries.
        // Introduce helper booleans for readability (Type III addition).
        const isOnRightmostColumn = (currentXCoordinate === totalGridColumns - 1);
        const isOnLeftmostColumn = (currentXCoordinate === 0);

        if (isOnRightmostColumn && currentMovementMode === MOVE_RIGHT) {
            // If at the right edge and moving right, move down a row and switch direction to left.
            currentYCoordinate++;
            currentMovementMode = MOVE_LEFT;
        } else if (isOnLeftmostColumn && currentMovementMode === MOVE_LEFT) {
            // If at the left edge and moving left, move down a row and switch direction to right.
            currentYCoordinate++;
            currentMovementMode = MOVE_RIGHT;
        } else if (currentMovementMode === MOVE_RIGHT) {
            // Otherwise, if moving right, simply advance to the next column.
            currentXCoordinate++;
        } else if (currentMovementMode === MOVE_LEFT) {
            // Otherwise, if moving left, simply retreat to the previous column.
            currentXCoordinate--;
        }
        
        // An additional safety check (Type III addition) could ensure coordinates remain valid.
        // if (currentYCoordinate >= totalGridRows) {
        //     // This condition would indicate a logic error or insufficient grid size.
        //     // break; // Or throw new Error("Grid overflow detected!");
        // }
    }
}

// --- Output Formatting and Display ---

// Transform the filled 2D array into a single string for standard output.
// Each row's elements are joined by a single space, and then all rows
// are joined by a newline character.
const finalOutputString = outputMatrix.map(rowContent => rowContent.join(' ')).join('\n');

// Print the formatted grid to the console.
console.log(finalOutputString);