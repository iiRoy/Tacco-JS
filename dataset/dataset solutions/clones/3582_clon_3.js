process.stdin.resume(); // Ensures the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Sets the character encoding for incoming data.

// Variable to buffer all incoming standard input data.
let rawInputDataBuffer = '';

// Event listener for data chunks received from stdin.
process.stdin.on('data', function(receivedSegment) {
    rawInputDataBuffer += receivedSegment; // Appends each new data chunk to the buffer.
});

// Event listener for the 'end' of the stdin stream.
process.stdin.on('end', function() {
    // Splits the accumulated data into individual lines.
    // Handles both Windows-style (\r\n) and Unix-style (\n) line endings.
    let initialInputSegments = rawInputDataBuffer.split(/\r?\n/);

    // Invokes the primary processing function with the parsed input lines.
    performGridShrinkage(initialInputSegments);
});

// --- Helper Functions for Grid Manipulation ---

/**
 * Transposes a 2D array (matrix), effectively swapping rows and columns.
 *
 * @param {Array<Array<string>>} twoDimArray The matrix to transpose, where each inner array is a row of characters.
 * @returns {Array<Array<string>>} The transposed matrix. Returns an empty array if the input is invalid or empty.
 */
function matrixTranspose(twoDimArray) {
    if (!twoDimArray || twoDimArray.length === 0 || twoDimArray[0].length === 0) {
        return [];
    }
    const numRows = twoDimArray.length;
    const numCols = twoDimArray[0].length;
    // Initialize the result matrix with dimensions swapped (cols x rows).
    const resultMatrix = Array.from({ length: numCols }, () => Array(numRows).fill(''));
    
    // Populate the transposed matrix.
    for (let rIdx = 0; rIdx < numRows; rIdx++) {
        for (let cIdx = 0; cIdx < numCols; cIdx++) {
            resultMatrix[cIdx][rIdx] = twoDimArray[rIdx][cIdx];
        }
    }
    return resultMatrix;
}

/**
 * Processes a grid of characters (represented as an array of strings).
 * It iteratively removes any rows or columns that do not contain the '#' character.
 *
 * @param {string[]} currentGridSnapshot An array of strings, where each string represents a row of the grid.
 * @returns {[boolean, string]} A tuple containing:
 *   - The first element (`boolean`) is `true` if any rows or columns were removed during this pass, `false` otherwise.
 *   - The second element (`string`) is the processed grid content as a single string, with rows joined by newlines.
 */
function refineGridContent(currentGridSnapshot) {
    let wasAlteredInThisPass = false;
    // Create a copy of the input lines to prevent direct modification of the caller's array reference.
    let workingLines = [...currentGridSnapshot];

    // Stage 1: Eliminate rows that do not contain any '#' markers.
    const initialLineCount = workingLines.length;
    workingLines = workingLines.filter(lineSegment => {
        const containsMarker = lineSegment.includes('#');
        if (!containsMarker) {
            wasAlteredInThisPass = true; // Mark as altered if a line is removed.
        }
        return containsMarker;
    });

    // If all lines were removed, the grid is now empty.
    if (workingLines.length === 0) {
        return [wasAlteredInThisPass, ""];
    }

    // Stage 2: Convert string lines into character arrays for easier column manipulation.
    let charGridMatrix = workingLines.map(lineSegment => lineSegment.split(''));

    // Guard against an empty matrix after row processing (e.g., if lines contained only empty strings).
    if (charGridMatrix.length === 0 || charGridMatrix[0].length === 0) {
        return [wasAlteredInThisPass, ""];
    }

    // Stage 3: Eliminate columns that do not contain any '#' markers.
    // This is achieved by transposing the matrix, filtering the "rows" (which were original columns),
    // and then transposing it back to its original orientation.
    let transposedCharMatrix = matrixTranspose(charGridMatrix);

    let filteredTransposedMatrix = [];
    let columnRemovalOccurred = false;

    // Filter out 'rows' from the transposed matrix if they don't contain '#'.
    // Each 'columnAsRow' here represents an original column.
    transposedCharMatrix.forEach(columnAsRow => {
        if (columnAsRow.includes('#')) {
            filteredTransposedMatrix.push(columnAsRow);
        } else {
            columnRemovalOccurred = true; // A column was removed.
        }
    });

    if (columnRemovalOccurred) {
        wasAlteredInThisPass = true; // The overall grid was altered.
    }

    // If all columns were removed after processing.
    if (filteredTransposedMatrix.length === 0) {
        return [wasAlteredInThisPass, ""];
    }

    // Transpose the matrix back to restore rows and columns to their original meaning.
    charGridMatrix = matrixTranspose(filteredTransposedMatrix);

    // Stage 4: Reconstruct string lines from the processed character arrays.
    const finalGridLines = charGridMatrix.map(charArray => charArray.join(''));

    // Stage 5: Combine all final lines into a single string, separated by newlines.
    const finalGridOutput = finalGridLines.join('\n');

    return [wasAlteredInThisPass, finalGridOutput];
}

// --- Main Execution Orchestrator ---

/**
 * Orchestrates the grid processing based on standard input.
 * It typically removes the first line (often metadata like a count) and then
 * repeatedly refines the grid by removing empty rows/columns until no more changes can be made.
 *
 * @param {string[]} incomingLines An array of lines read from standard input.
 */
function performGridShrinkage(incomingLines) {
    // Remove the first line of input. In many competitive programming problems,
    // this line contains metadata (e.g., number of test cases, grid dimensions)
    // and is not part of the actual grid data.
    const metadataLine = incomingLines.shift(); // `shift()` modifies the array in place.

    // Guard clause: If no grid data remains after removing the metadata line.
    if (incomingLines.length === 0) {
        console.log(""); // Output an empty string if the grid is empty.
        return;
    }

    // Initialize the current state of the grid as a single string.
    // The `refineGridContent` function expects an array of strings, so it will be split back later.
    let currentGridState = incomingLines.join('\n');
    let processingOutcome; // Stores the [wasAltered, processedContent] tuple from `refineGridContent`.

    // Loop repeatedly until `refineGridContent` reports that no further changes were made.
    do {
        // Convert the current grid string back into an array of lines for processing.
        // This ensures `refineGridContent` always receives input in its expected `string[]` format.
        processingOutcome = refineGridContent(currentGridState.split('\n'));
        currentGridState = processingOutcome[1]; // Update the grid state with the processed content.
    } while (processingOutcome[0]); // Continue looping if `wasAltered` is true.

    // Output the final, fully refined grid to standard output.
    console.log(currentGridState);
}