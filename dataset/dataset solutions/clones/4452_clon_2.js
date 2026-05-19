"use strict";

// This script processes input to generate a grid-like output
// based on specified dimensions and color counts.
const processInput = (inputString) => {
    // Trim leading/trailing whitespace and split the input into lines
    let lines = inputString.trim().split("\n");

    // Parse grid dimensions from the first line
    const dimensions = lines[0].split(" ");
    const gridHeight = parseInt(dimensions[0], 10); // Height of the grid
    const gridWidth = parseInt(dimensions[1], 10);  // Width of the grid

    // Parse the number of distinct colors from the second line
    const totalColors = parseInt(lines[1], 10);

    // Parse the counts for each color from the third line
    // Each number indicates how many cells should be filled with that color.
    const colorQuantities = lines[2].split(" ").map(strVal => parseInt(strVal, 10));

    // Temporary array to hold the flattened grid data (color IDs in sequence)
    let flatGridSequence = [];

    // Handle the edge case where the grid is a single cell
    if (gridHeight * gridWidth === 1) {
        console.log(1); // Output '1' as the only cell will be color 1
        return; // Exit the function
    }

    // Populate the flatGridSequence array
    // For each color (from 1 to totalColors), add its ID to the sequence
    // as many times as specified in colorQuantities.
    for (let colorIdentifier = 1; colorIdentifier <= totalColors; colorIdentifier++) {
        // The colorQuantities array is 0-indexed, so we use colorIdentifier - 1
        for (let countIterator = 0; countIterator < colorQuantities[colorIdentifier - 1]; countIterator++) {
            flatGridSequence.push(colorIdentifier);
        }
    }

    // Array to store the final formatted rows for output
    let finalOutputRows = [];
    // Temporary array to build the current row before adding it to finalOutputRows
    let currentRowData = [];

    // Iterate through the flattened sequence to form rows
    for (let sequenceIndex = 0; sequenceIndex < flatGridSequence.length; sequenceIndex++) {
        // Add the current color ID to the currentRowData
        currentRowData.push(flatGridSequence[sequenceIndex]);

        // Check if the current row is complete (based on gridWidth)
        // The condition `(sequenceIndex + 1) % gridWidth === 0` means we've just added the last element of a row.
        // `sequenceIndex !== 0` ensures we don't process an empty row at the very beginning if gridWidth is 1.
        if ( (sequenceIndex + 1) % gridWidth === 0 ) {
            // If the row's ending index is odd, reverse the row for a snake-like pattern
            if (sequenceIndex % 2 !== 0) {
                currentRowData.reverse();
            }

            // Join the elements of the current row with spaces and add to the final output
            finalOutputRows.push(currentRowData.join(" "));
            // Reset currentRowData for the next row
            currentRowData = [];
        }
    }

    // Join all the formatted rows with newline characters and print to console
    console.log(finalOutputRows.join("\n"));
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
