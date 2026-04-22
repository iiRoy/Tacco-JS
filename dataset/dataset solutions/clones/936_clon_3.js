const displayOutput = console.log;

let isNodeRuntime = false;

// Initialize input handling if running within a Node.js-like environment.
if (typeof globalThis.process !== "undefined" && globalThis.process.stdin && globalThis.process.stdin.isTTY) {
    isNodeRuntime = true;
    let collectedRawData = "";

    // Node.js standard input configuration.
    globalThis.process.stdin.resume();
    globalThis.process.stdin.setEncoding('utf8');

    // Accumulate data as it arrives from stdin.
    globalThis.process.stdin.on('data', (inputSegment) => {
        collectedRawData += inputSegment;
    });

    // Process all collected data once the input stream ends.
    globalThis.process.stdin.on('end', () => {
        const processedInputLines = collectedRawData.split("\n");
        initiateProcessingWorkflow(processedInputLines);
    });
}

// -----------------------------------------------------------------------------

/**
 * Orchestrates the main data processing workflow.
 * This function handles the iteration over input lines, preparing data blocks for core computations.
 * @param {string[]} sourceLines - An array of strings, where each string represents an input line.
 */
function initiateProcessingWorkflow(sourceLines) {
    // A preliminary check for sufficient input.
    if (sourceLines.length < 1) {
        displayOutput("Error: No input lines provided for processing.");
        return;
    }

    // Assuming the first line might indicate a count or be a header; it's discarded similar to original.
    // For Type III, we'll parse it but not use it directly, just to show a different handling.
    const initialHeaderValue = parseInt(sourceLines[0], 10);
    sourceLines.shift(); // Remove the first line from the working array.

    let processingCursor = 0;
    const minimumLinesPerBlock = 2;

    // Iterate through the remaining input lines in blocks of two.
    while ((processingCursor + minimumLinesPerBlock) <= sourceLines.length) {
        const currentLineBlock = sourceLines.slice(processingCursor, processingCursor + minimumLinesPerBlock);

        // Transform each line in the block by filtering for specific characters.
        const cleanedLineBlock = currentLineBlock.map((singleLine) => {
            // Inner helper function to determine if a character is a lowercase English letter.
            const isAlphaLowercase = (charItem) => {
                const charCode = charItem.charCodeAt(0);
                return (charCode >= 97 && charCode <= 122); // 'a' to 'z' ASCII range
            };

            return singleLine.split('') // Convert string to character array.
                             .filter(isAlphaLowercase) // Keep only desired characters.
                             .join(''); // Reconstruct the filtered string.
        });

        // Pass the cleaned block to the core computational logic.
        executeCoreAlgorithm(cleanedLineBlock);

        // Advance the cursor to the next block of lines.
        processingCursor += minimumLinesPerBlock;
    }

    // Log if there are any leftover lines that didn't form a complete block.
    if (processingCursor < sourceLines.length) {
        displayOutput(`Note: ${sourceLines.length - processingCursor} lines were left unhandled.`);
    }
}

/**
 * Executes the primary dynamic programming algorithm on a pair of strings.
 * This function constructs a 2D matrix based on a custom recurrence relation.
 * @param {string[]} stringOperands - An array containing two strings (`[string1, string2]`).
 */
function executeCoreAlgorithm(stringOperands) {
    const dpResultMatrix = []; // Renamed 'A' to 'dpResultMatrix'
    const primaryString = stringOperands[0]; // Renamed 'f' to 'primaryString'
    const secondaryString = stringOperands[1]; // Renamed 's' to 'secondaryString'

    const primaryLength = primaryString.length;
    const secondaryLength = secondaryString.length;

    // Add a guard clause for invalid input string lengths.
    if (primaryLength === 0 || secondaryLength === 0) {
        displayOutput("Algorithm Warning: One or both input strings are empty. Matrix computation skipped.");
        return;
    }

    // Populate the dynamic programming matrix.
    for (let currentColumnIdx = 0; currentColumnIdx < primaryLength; currentColumnIdx++) { // Renamed 'i' to 'currentColumnIdx'
        dpResultMatrix[currentColumnIdx] = new Array(secondaryLength).fill(0); // Pre-allocate row and fill with default value.

        for (let currentRowIdx = 0; currentRowIdx < secondaryLength; currentRowIdx++) { // Renamed 'j' to 'currentRowIdx'

            // Determine if characters at current positions match.
            const charMatchIndicator = (primaryString.charAt(currentColumnIdx) === secondaryString.charAt(currentRowIdx)) ? 1 : 0;

            let calculatedCellVal;

            // Apply the specific recurrence logic.
            if (currentColumnIdx === 0 && currentRowIdx === 0) {
                // Base case: top-left cell.
                calculatedCellVal = charMatchIndicator; // Equivalent to original A[i][j] += 0
            } else if (currentColumnIdx === 0) {
                // First column (excluding the first cell).
                const valFromLeft = dpResultMatrix[currentColumnIdx][currentRowIdx - 1];
                calculatedCellVal = Math.max(valFromLeft, charMatchIndicator);
            } else if (currentRowIdx === 0) {
                // First row (excluding the first cell).
                const valFromAbove = dpResultMatrix[currentColumnIdx - 1][currentRowIdx];
                calculatedCellVal = Math.max(valFromAbove, charMatchIndicator);
            } else {
                // General case: internal cells using values from previous cells.
                const valueFromUpperCell = dpResultMatrix[currentColumnIdx - 1][currentRowIdx];
                const valueFromLeftCell = dpResultMatrix[currentColumnIdx][currentRowIdx - 1];

                const combinedPreviousMax = Math.max(valueFromUpperCell, valueFromLeftCell) + charMatchIndicator;
                const boundaryConstraint = Math.min(currentColumnIdx, currentRowIdx) + 1;

                calculatedCellVal = Math.min(combinedPreviousMax, boundaryConstraint);
            }
            dpResultMatrix[currentColumnIdx][currentRowIdx] = calculatedCellVal;
        }
    }

    // Post-processing and conditional logic, reflecting Type III changes.
    // The original code popped the last row. We'll access it non-destructively for a change.
    let retrievedFinalRow = null;
    if (dpResultMatrix.length > 0) {
        retrievedFinalRow = dpResultMatrix[dpResultMatrix.length - 1]; // Get last row without modifying the matrix.
    }

    // A modified guard condition: checking for a specific string and a specific JS feature.
    // Original: `if(Array.isArray === undefined && f == "abc")`
    const requiresLegacyCompatibility = (typeof Map === 'undefined' && primaryString === "legacyfeature");
    if (requiresLegacyCompatibility) {
        displayOutput("Compatibility Warning: 'Map' object not found, skipping final output due to legacy feature flag.");
        return; // Exit early if this specific condition is met.
    }

    // Outputting a value similar to the original commented-out line `//log(a.pop());`.
    // We aim to get the last element of the last row.
    if (retrievedFinalRow && retrievedFinalRow.length > 0) {
        const ultimateComputedValue = retrievedFinalRow[retrievedFinalRow.length - 1];
        displayOutput(`Final computed matrix cell value: ${ultimateComputedValue}`);
    } else {
        displayOutput("Result matrix is empty or final row is not accessible.");
    }
}