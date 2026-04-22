const outputMessage = console.log;

// This block handles reading input from standard input in a Node.js environment.
// It accumulates data chunks and processes them once the input stream ends.
if (typeof process !== "undefined" && process.stdin) {
    let receivedDataBuffer = ''; // A string buffer to collect all incoming data.

    // Ensure the standard input stream is set to resume, if it wasn't already.
    // This is a common practice for interactive or piped input.
    if (process.stdin.isPaused()) {
        process.stdin.resume();
    }
    
    // Explicitly set the encoding to UTF-8 for proper character handling.
    process.stdin.setEncoding('utf8');

    // Attach an event listener for 'data' chunks. Each chunk is appended to the buffer.
    process.stdin.on('data', (inputChunk) => {
        receivedDataBuffer += inputChunk;
    });

    // Attach an event listener for the 'end' of the input stream.
    // Once all data is received, it's processed.
    process.stdin.on('end', () => {
        // A dedicated internal function to manage the final input processing steps.
        const finalizeInputProcessing = (fullCollectedInput) => {
            // Split the complete input string into an array of individual lines.
            // Filter out any lines that are empty or contain only whitespace.
            const inputLineCollection = fullCollectedInput.split("\n").filter(line => line.trim().length > 0);
            
            // Proceed only if valid lines were received.
            if (inputLineCollection.length > 0) {
                // Call the primary function responsible for interpreting the input lines.
                processInputSequences(inputLineCollection);
            } else {
                outputMessage("No substantial input lines were provided for processing.");
            }
        };

        // Trigger the final processing sequence with the accumulated data.
        finalizeInputProcessing(receivedDataBuffer);
    });
}

/**
 * Orchestrates the processing of a collection of input lines.
 * It expects lines to be processed in pairs after discarding an initial header line.
 * @param {string[]} inputLineCollection - An array of raw input strings, each representing a line.
 */
function processInputSequences(inputLineCollection) {
    // The problem logic often discards the first line, potentially a count or header.
    // This ensures robustness against an empty collection.
    if (inputLineCollection.length > 0) {
        inputLineCollection.shift(); // Remove the first line.
    } else {
        outputMessage("Notice: Input line collection was empty after initial check. No sequences to process.");
        return; // Exit if there's nothing left to process.
    }

    let currentPairStartIndex = 0; // Index to keep track of the current pair's starting line.

    // Iterate through the input lines, processing them two at a time.
    // This loop structure handles advancing by two lines per iteration.
    for (; currentPairStartIndex < inputLineCollection.length; currentPairStartIndex += 2) {
        // Guard clause: Ensure there are enough lines remaining to form a complete pair.
        if (currentPairStartIndex + 1 >= inputLineCollection.length) {
            outputMessage("Warning: Encountered an odd number of lines at the end. Skipping the last incomplete pair.");
            break; // Terminate loop if an incomplete pair is detected.
        }

        // Extract the two raw strings that form the current processing pair.
        const rawStringPair = [
            inputLineCollection[currentPairStartIndex],
            inputLineCollection[currentPairStartIndex + 1]
        ];

        // Define ASCII character code constants for filtering.
        const CHAR_CODE_LOWER_A = 'a'.charCodeAt(0);
        const CHAR_CODE_LOWER_Z = 'z'.charCodeAt(0);

        // Clean each string in the pair: retain only lowercase English alphabetic characters.
        const cleanedStringTuple = rawStringPair.map(rawText => {
            return rawText.split('').filter(charElement => {
                const charCode = charElement.charCodeAt(0);
                // Check if the character's ASCII value is within the 'a' through 'z' range.
                return charCode >= CHAR_CODE_LOWER_A && charCode <= CHAR_CODE_LOWER_Z;
            }).join(''); // Reconstruct the string from filtered characters.
        });

        // Validation step: Check if either string became empty after the filtering process.
        if (cleanedStringTuple[0].length === 0 || cleanedStringTuple[1].length === 0) {
            outputMessage("Information: One or both strings in the current pair became empty after cleaning. This pair will be skipped.");
            continue; // Move to the next pair of lines.
        }

        // Pass the validated and cleaned string pair to the core analysis function.
        analyzeStringRelationship(cleanedStringTuple);
    }
}

/**
 * Computes a specific relationship value between two input strings using a dynamic programming approach.
 * The algorithm fills a matrix based on character matches and adjacent cell values.
 * @param {string[]} inputStringsTuple - An array containing exactly two cleaned strings.
 */
function analyzeStringRelationship(inputStringsTuple) {
    // Robust input validation for the string tuple.
    if (!Array.isArray(inputStringsTuple) || inputStringsTuple.length !== 2 ||
        typeof inputStringsTuple[0] !== 'string' || typeof inputStringsTuple[1] !== 'string') {
        outputMessage("Error: analyzeStringRelationship received invalid input. Expected an array of two strings.");
        return; // Abort if input is not as expected.
    }

    const firstSequence = inputStringsTuple[0];  // The first string to be analyzed.
    const secondSequence = inputStringsTuple[1]; // The second string to be analyzed.

    // Initialize the dynamic programming matrix (2D array).
    // It will store intermediate calculation results.
    const dpMatrix = [];

    // Wrap the core DP logic in a try-catch block to gracefully handle runtime errors.
    try {
        // Iterate through the characters of the first sequence (rows of the matrix).
        for (let rowIdx = 0; rowIdx < firstSequence.length; rowIdx++) {
            dpMatrix[rowIdx] = []; // Initialize the current row as an empty array.

            // Iterate through the characters of the second sequence (columns of the matrix).
            for (let colIdx = 0; colIdx < secondSequence.length; colIdx++) {
                let cellMatchContribution = 0; // Default contribution if characters don't match.

                // Determine if the characters at the current indices are identical.
                if (firstSequence[rowIdx] === secondSequence[colIdx]) {
                    cellMatchContribution = 1; // Set contribution to 1 if characters match.
                }

                // Apply the dynamic programming rules based on the current cell's position.
                if (rowIdx === 0 && colIdx === 0) {
                    // For the top-leftmost cell [0][0], its value is simply its direct contribution.
                    // The original `A[i][j] += 0;` was a no-op and has been removed.
                    dpMatrix[rowIdx][colIdx] = cellMatchContribution;
                } else if (rowIdx === 0) {
                    // For cells in the first row (excluding [0][0]), the value is the maximum
                    // of the cell to its immediate left and its own match contribution.
                    const valueFromLeftInRow = dpMatrix[rowIdx][colIdx - 1];
                    dpMatrix[rowIdx][colIdx] = Math.max(valueFromLeftInRow, cellMatchContribution);
                } else if (colIdx === 0) {
                    // For cells in the first column (excluding [0][0]), the value is the maximum
                    // of the cell directly above it and its own match contribution.
                    const valueFromAboveInCol = dpMatrix[rowIdx - 1][colIdx];
                    dpMatrix[rowIdx][colIdx] = Math.max(valueFromAboveInCol, cellMatchContribution);
                } else {
                    // For all other general cells, a more complex calculation is performed.
                    // It involves values from the cell above and the cell to the left.
                    const valueFromUpperCell = dpMatrix[rowIdx - 1][colIdx];
                    const valueFromLeftCell = dpMatrix[rowIdx][colIdx - 1];

                    // Calculate an intermediate sum: max of adjacent values plus current match contribution.
                    const combinedSum = Math.max(valueFromUpperCell, valueFromLeftCell) + cellMatchContribution;

                    // Compute a "diagonal limit" based on the minimum of the current row and column indices plus one.
                    const indexBasedConstraint = Math.min(rowIdx, colIdx) + 1;

                    // The final cell value is the minimum of the combined sum and the index-based constraint.
                    dpMatrix[rowIdx][colIdx] = Math.min(combinedSum, indexBasedConstraint);
                }
            }
        }

        // After the matrix is fully populated, the final result is typically found
        // at the bottom-right corner of the matrix.
        // A check ensures the matrix has valid dimensions before attempting access.
        if (dpMatrix.length > 0 && dpMatrix[0].length > 0) {
            const finalRowIndex = firstSequence.length - 1;
            const finalColIndex = secondSequence.length - 1;
            outputMessage(dpMatrix[finalRowIndex][finalColIndex]);
        } else {
            outputMessage("Warning: The DP matrix is empty or malformed after processing. No final result available.");
        }

    } catch (operationError) {
        // If any error occurs during the matrix calculation, log it.
        outputMessage(`An unexpected error occurred during string relationship analysis: ${operationError.message}`);
    }
}