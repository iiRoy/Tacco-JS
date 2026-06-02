"use strict";

// This function processes the provided input string to manipulate a grid of characters.
function processInput(inputData) {
    inputData = inputData.trim(); // Remove leading/trailing whitespace.

    // Parse grid dimensions from the first line of input.
    const firstLineParts = inputData.split("\n")[0].split(" ");
    const columnCount = parseInt(firstLineParts[1]); // X dimension
    const rowCount = parseInt(firstLineParts[0]);    // Y dimension

    // Extract grid lines, skipping the first line which contains dimensions.
    // Note: The original slice behavior `inputData.length - 1` is preserved.
    let gridLines = inputData.split("\n").slice(1, inputData.length - 1);

    // Identify rows that contain no '#' characters.
    let emptyRows = [];
    for (let rowIndex = 0; rowIndex <= rowCount; rowIndex++) {
        if (gridLines[rowIndex].indexOf("#") === -1) {
            emptyRows.push(rowIndex);
        }
    }

    // Remove identified empty rows, iterating backwards to avoid index issues.
    for (let k = emptyRows.length - 1; k >= 0; k--) {
        gridLines.splice(emptyRows[k], 1);
    }

    // Iterate through columns to find and remove columns with no '#' characters.
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        let columnChars = [];
        for (let lineIndex = 0; lineIndex < gridLines.length; lineIndex++) {
            columnChars.push(gridLines[lineIndex][colIndex]);
        }

        // If a column contains no '#' characters, remove it from all remaining rows.
        if (columnChars.indexOf("#") === -1) {
            for (let lineIndex = gridLines.length - 1; lineIndex >= 0; lineIndex--) {
                gridLines[lineIndex] = gridLines[lineIndex]
                    .split("")
                    .filter((charValue, charPosition) => charPosition !== colIndex)
                    .join("");
            }
        }
    }

    // Special handling if only one row remains after processing.
    if (gridLines.length === 1) {
        // The original code's filter `n=>n=="#"` effectively keeps all characters
        // because `n = "#"` assigns and then evaluates to a truthy value.
        console.log(gridLines[0].split("").filter(charItem => charItem =="#").join(""));
        return;
    }

    // Output the modified grid, joining lines with newlines.
    console.log(gridLines.join("\n"));
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
