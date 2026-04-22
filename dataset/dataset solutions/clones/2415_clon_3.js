"use strict"; // Enforce strict mode for cleaner code.

/**
 * Main processing function for the grid assignment task.
 * Reads raw input, parses grid dimensions and content, then assigns unique
 * numerical identifiers (colors) to cells based on a specific logic involving
 * a special marker character ('#').
 *
 * @param {string} rawDataInput - The entire input string, typically from stdin.
 */
const processGridAssignment = (rawDataInput) => {
    // Step 1: Prepare the input data.
    // Remove any leading/trailing whitespace from the whole input, then split it into an array of lines.
    const inputLines = rawDataInput.trim().split("\n");

    // Step 2: Parse grid dimensions from the first line.
    // The first line is expected to contain space-separated values for height, width, and an unused 'K' value.
    const dimensionTokens = inputLines[0].split(" ");
    
    // Explicitly convert string tokens to numbers for grid dimensions.
    const gridHeight = Number(dimensionTokens[0]);
    const gridWidth  = Number(dimensionTokens[1]);
    // Note: The original code parsed a third value (K) but never used it.
    // As a Type III modification, we are deliberately omitting its parsing here,
    // reflecting a deletion of non-essential code.
    // const unusedValueK = Number(dimensionTokens[2]); 

    // Step 3: Implement a guard clause for basic input validation.
    // Ensure that grid dimensions are positive integers.
    if (!Number.isInteger(gridHeight) || !Number.isInteger(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        // If dimensions are invalid, output an empty string as a graceful failure,
        // rather than crashing or producing unexpected results.
        console.log(""); 
        return; 
    }

    // Step 4: Parse the character grid content.
    // Extract the lines that represent the grid itself (from the second line onwards).
    // Use `map` to transform each line string into an array of individual characters.
    const characterGridSource = inputLines.slice(1, gridHeight + 1).map(lineStr => lineStr.split(""));

    // Step 5: Initialize the result matrix.
    // Create a 2D array (matrix) of the specified dimensions, filled with zeros initially.
    // `Array.from` provides a concise way to create an array and map its elements.
    const resultIdentifierMatrix = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));

    // Step 6: Define constants for clarity.
    // Use a constant for the special marker character to improve readability and maintainability.
    const SPECIAL_MARKER_CHAR = '#';

    // Step 7: Core logic for assigning identifiers (colors).
    // `currentSegmentIdentifier` acts as the 'color' counter. It increments for new segments or new rows.
    let currentSegmentIdentifier = 1; 
    // `hashEncounteredInCurrentBlock` acts as a flag to detect if a '#' has been seen
    // within the current contiguous identifier block of the row.
    let hashEncounteredInCurrentBlock = false; 

    // Iterate through each row of the grid.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        // Iterate through each column within the current row.
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellContent = characterGridSource[rowIdx][colIdx];

            // Logic for incrementing the identifier within a row:
            // If the current cell is the special marker AND a marker was already found
            // in the current segment of this row, it means a new segment starts.
            if (currentCellContent === SPECIAL_MARKER_CHAR && hashEncounteredInCurrentBlock) {
                currentSegmentIdentifier++; 
                hashEncounteredInCurrentBlock = false; // Reset the flag for the newly started segment.
            }
            
            // Logic for setting the flag:
            // If the current cell is the special marker, set the flag. This prepares
            // for a potential identifier increment if another marker is found later in the same segment.
            if (currentCellContent === SPECIAL_MARKER_CHAR) {
                hashEncounteredInCurrentBlock = true;
            }
    
            // Assign the current identifier to the corresponding cell in the result matrix.
            resultIdentifierMatrix[rowIdx][colIdx] = currentSegmentIdentifier;
        }
        
        // After an entire row has been processed:
        // Increment the identifier for the next row, as each new row represents a new major segment.
        currentSegmentIdentifier++;
        // Reset the flag for the next row, ensuring it starts fresh without carrying over state
        // from the previous row's marker detection.
        hashEncounteredInCurrentBlock = false; 
    }
    
    // Step 8: Generate the final output string.
    // The original code used `answer.join("\n")` on a 2D array.
    // When `join()` is called on an array of arrays, it implicitly calls `toString()` on each sub-array,
    // which results in comma-separated values (e.g., `1,1,1\n2,2,2`).
    // This line replicates that exact output format.
    console.log(resultIdentifierMatrix.join("\n"));
};

// Entry point of the script:
// Reads the entire content from standard input (`/dev/stdin`) as a UTF-8 string,
// then passes it to the `processGridAssignment` function for execution.
processGridAssignment(require('fs').readFileSync('/dev/stdin', 'utf8'));