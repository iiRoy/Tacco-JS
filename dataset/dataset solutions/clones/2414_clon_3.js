const fileSystemModule = require('fs'); // Import the Node.js file system module for input operations

// --- Input Acquisition and Initial Parsing ---
// Retrieve all raw input from stdin, decoding it as UTF-8, then split into individual lines.
const rawContentStream = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const linesOfInput = rawContentStream.split('\n');

// Extract and parse the grid dimensions and an auxiliary parameter from the very first line.
const firstLineData = linesOfInput.shift(); // Remove the first line from the input array
const initialDimensions = firstLineData.split(' ');

// Convert string dimensions to integers using radix 10 for safety.
const matrixHeight = parseInt(initialDimensions[0], 10);
const matrixWidth = parseInt(initialDimensions[1], 10);
const auxiliaryParameter = parseInt(initialDimensions[2], 10); // This parameter (K in original) is not utilized in the core logic.

// Initialize the primary data structure to store the processed block identifiers.
// Each row is initially null, signifying it's yet to be processed or resolved.
const processedBlockMatrix = Array.from({ length: matrixHeight }, () => null);

// A counter for assigning unique, sequential block IDs across the grid.
let blockSequenceId = 1;

// A variable to hold the pattern of the most recently processed, non-empty row.
// This is used to fill subsequent empty rows.
let previousResolvedRowPattern = null;

// --- Core Grid Processing Loop ---
// Iterate through each row of the input data to determine its block identifiers.
for (let rowIdx = 0; rowIdx < matrixHeight; ++rowIdx) {
    const currentInputRowString = linesOfInput[rowIdx]; // Fetch the string representation of the current row.

    // Discover all column indices where the special '#' character is present in this row.
    const separatorColumnIndices = [];
    for (let colIdx = 0; colIdx < matrixWidth; ++colIdx) {
        if (currentInputRowString[colIdx] === '#') {
            separatorColumnIndices.push(colIdx);
        }
    }

    // Determine the processing path based on the presence of '#' separators.
    if (separatorColumnIndices.length === 0) {
        // Case 1: No '#' separators found in the current row.
        // This row will inherit its pattern from a previous resolved row.
        if (previousResolvedRowPattern) {
            // If a valid pattern exists, assign a copy of it to the current row.
            processedBlockMatrix[rowIdx] = [...previousResolvedRowPattern];
        } else {
            // If no pattern has been established yet, mark this row as needing resolution later.
            // Using a distinct string constant for this unresolved state.
            processedBlockMatrix[rowIdx] = 'PENDING_RESOLUTION';
        }
    } else {
        // Case 2: '#' separators are present, so generate block IDs for this row.
        const currentRowIdentifierArray = new Array(matrixWidth); // Array to hold IDs for the current row.
        let currentFillColumn = 0; // Pointer for filling `currentRowIdentifierArray`.

        // Process each '#' marker to define and assign IDs to blocks.
        // Blocks are segments between the start/previous '#' and the current '#'.
        for (const markerColumn of separatorColumnIndices) {
            // Fill the segment from `currentFillColumn` up to `markerColumn` (inclusive)
            // with the current `blockSequenceId`.
            for (let fillSegmentCol = currentFillColumn; fillSegmentCol <= markerColumn; ++fillSegmentCol) {
                currentRowIdentifierArray[fillSegmentCol] = blockSequenceId;
            }
            // Advance the column pointer past the current marker.
            currentFillColumn = markerColumn + 1;
            // Increment the block ID for the next distinct segment.
            blockSequenceId++;
        }

        // After all markers are processed, fill any remaining segment of the row.
        // This final segment takes the ID of the *last* block created (which is `blockSequenceId - 1`).
        for (let fillFinalSegmentCol = currentFillColumn; fillFinalSegmentCol < matrixWidth; ++fillFinalSegmentCol) {
            currentRowIdentifierArray[fillFinalSegmentCol] = blockSequenceId - 1;
        }

        // Store the newly generated pattern for the current row.
        processedBlockMatrix[rowIdx] = currentRowIdentifierArray;
        // Update the `previousResolvedRowPattern` with a copy of this row's pattern for future use.
        previousResolvedRowPattern = [...currentRowIdentifierArray];
    }
}

// --- Post-Processing for Initially Unresolved Rows ---
// If the first row (or a sequence of initial rows) was marked 'PENDING_RESOLUTION',
// they need to be back-filled using the pattern of the first successfully resolved row.
const UNRESOLVED_STATE_MARKER = 'PENDING_RESOLUTION'; // Constant for the unresolved state.

if (processedBlockMatrix[0] === UNRESOLVED_STATE_MARKER) {
    let firstResolvedRowIndex = 0;
    // Search for the index of the first row that contains a resolved pattern.
    while (firstResolvedRowIndex < matrixHeight && processedBlockMatrix[firstResolvedRowIndex] === UNRESOLVED_STATE_MARKER) {
        firstResolvedRowIndex++;
    }

    // If a resolved row was found (it's assumed one will always exist based on problem constraints).
    if (firstResolvedRowIndex < matrixHeight) {
        // Obtain the definitive pattern from this first resolved row.
        const definitivePatternForBackfill = processedBlockMatrix[firstResolvedRowIndex];

        // Iterate backwards from the first resolved row to fill all preceding unresolved rows.
        for (let backfillTargetRow = firstResolvedRowIndex - 1; backfillTargetRow >= 0; --backfillTargetRow) {
            processedBlockMatrix[backfillTargetRow] = [...definitivePatternForBackfill]; // Assign a copy of the pattern.
        }
    }
    // No explicit handling for the edge case where ALL rows are 'PENDING_RESOLUTION',
    // as the original code implicitly assumes at least one row will resolve.
}

// --- Output Formatting and Display ---
// Convert the 2D array of block IDs into the final string format required for output.
// Each row's IDs are joined by spaces, and the rows themselves are joined by newline characters.
const finalOutputStringRepresentation = processedBlockMatrix
    .map(rowArrayOrMarker => {
        if (Array.isArray(rowArrayOrMarker)) {
            // If it's an array of numbers, join them with spaces.
            return rowArrayOrMarker.join(' ');
        } else {
            // If it's an unresolved marker (e.g., 'PENDING_RESOLUTION'), convert it to string.
            // This handles cases where all rows might end up unresolved (though not expected).
            return String(rowArrayOrMarker);
        }
    })
    .join('\n');

// Print the final formatted output to the console.
console.log(finalOutputStringRepresentation);