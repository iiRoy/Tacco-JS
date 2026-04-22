"use strict";

// This function is responsible for processing a given string input to locate a specific keyword
// within a grid-like structure defined by the input, and then outputting its grid coordinates.
const processInputData = ( inputStringContent ) => {
    // Begin by cleaning the input: remove any extraneous whitespace at the ends and split into individual lines.
    inputStringContent = inputStringContent
                            .trim()
                            .split("\n");

    // The initial line of the input typically contains the dimensions of the grid.
    const dimensionsInfo = inputStringContent[0].split(" ");
    const numRows = parseInt(dimensionsInfo[0]); // Extract the total number of rows from the first dimension part.
    const numCols = parseInt(dimensionsInfo[1]); // Extract the total number of columns from the second dimension part.

    // Now, extract the actual grid content. This involves skipping the dimension line,
    // and for each subsequent line, splitting it into individual cell values.
    const gridCells = inputStringContent
                        .slice(1, numRows + 1) // Select only the lines that represent grid rows.
                        .map( (lineOfText) => lineOfText.split(" ") ); // Convert each row string into an array of cell strings.

    // Define a set of characters that will be used to label the columns, e.g., A, B, C...
    const columnLabels = "ABCDEFGHIJ".split("");

    // Iterate through each row of the grid.
    for ( let currentR = 0; currentR < numRows; currentR++ ) {
        // Within each row, iterate through each column.
        for ( let currentC = 0; currentC < numCols; currentC++ ) {
            // Check if the current cell's content matches our predefined secret word.
            if ( gridCells[currentR][currentC] === "secretKeyword" ) {
                // If the secret word is found, log its coordinates.
                // The column is identified by its corresponding character label,
                // and the row is identified by its 1-based index (currentR + 1).
                console.log( columnLabels[currentC] + ( currentR + 1 ) );
            }
        }
    }
}; // End of the primary data processing function.

// Execute the main processing function by reading the entire content from standard input
// and passing it as a UTF-8 encoded string.
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );