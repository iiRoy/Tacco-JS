"use strict";

// This function serves as the primary entry point for processing the provided input string.
function processInputData(rawContent) {
    // Sanitize the initial input by removing any extraneous whitespace from its edges.
    rawContent = rawContent.trim();

    // From the first line of the input, extract and parse the value representing the total number of columns.
    const numCols = parseInt(rawContent.split("\n")[0].split(" ")[1]);
    // Similarly, extract and parse the value indicating the total number of rows.
    const numRows = parseInt(rawContent.split("\n")[0].split(" ")[0]);

    // Segment the raw input string into an array of individual data fragments (lines),
    // skipping the initial header line that contained dimensions.
    const dataFragments = rawContent.split("\n").slice(1, rawContent.length - 1);

    // Prepare an array to hold the indices of rows that are found to be completely empty of '#' markers.
    let blankRows = [];
    // Iterate through each row, from the first up to the specified number of rows.
    for (let rowIdx = 0; rowIdx <= numRows; rowIdx++) {
        // If the current data fragment (row) does not contain the '#' character,
        // it signifies an empty row that should be removed.
        if (dataFragments[rowIdx].indexOf("#") === -1) {
            blankRows.push(rowIdx); // Store the index of this blank row.
        }
    }

    // Now, proceed to eliminate the identified blank rows from the collection of data fragments.
    // The iteration is performed in reverse to prevent index shifting issues during `splice` operations.
    for (let rowIdx = blankRows.length - 1; rowIdx >= 0; rowIdx--) {
        dataFragments.splice(blankRows[rowIdx], 1); // Remove the row at the recorded index.
    }

    // Initiate a loop to traverse and inspect each column within the processed data fragments.
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
        // Create a temporary array to aggregate characters belonging to the current column.
        let colContent = [];
        for (let rowIdx = 0; rowIdx < dataFragments.length; rowIdx++) {
            colContent.push(dataFragments[rowIdx][colIdx]); // Add the character at the current column position from each row.
        }

        // Determine if the assembled column content contains no '#' character.
        if (colContent.indexOf("#") === -1) {
            // If the column is entirely blank, remove the character at this column index from every row.
            // Iterate through the rows in reverse order for safe modification.
            for (let rowIdx = dataFragments.length - 1; rowIdx >= 0; rowIdx--) {
                dataFragments[rowIdx] = dataFragments[rowIdx].split("").filter((elementChar, charPos) => charPos !== colIdx).join("");
            }
        }
    }

    // After all row and column cleanup, check if only a single data fragment (row) remains.
    if (dataFragments.length === 1) {
        // If so, extract only the '#' characters from this final row and display them.
        console.log(dataFragments[0].split("").filter(testChar => testChar === "#").join(""));
        return; // Terminate execution, as the result has been printed.
    }

    // In all other cases (more than one row remaining), output the entire set of
    // remaining data fragments, with each fragment on a new line.
    console.log(dataFragments.join("\n"));
}

// Execute the main processing function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));