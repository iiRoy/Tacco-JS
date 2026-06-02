"use strict";

// This function processes the input string to generate a colored grid pattern.
const processInput = (inputString) => {
    // Split the input into lines and remove leading/trailing whitespace.
    inputString = inputString.trim().split("\n");

    // Parse grid dimensions from the first line.
    const heightVal = parseInt(inputString[0].split(" ")[0]); // The height of the grid (unused in logic)
    const widthVal = parseInt(inputString[0].split(" ")[1]);  // The width of the grid

    // Parse the number of distinct colors from the second line.
    const numColors = parseInt(inputString[1]);

    // Parse the counts for each color from the third line.
    const colorCounts = inputString[2].split(" ").map(val => parseInt(val));

    // Initialize an array to store the expanded sequence of colors.
    let colorSequence = [];

    // Handle the special case where there's only one color.
    if (numColors === 1) {
        console.log(1); // Output '1' as the only color.
        return;         // Exit the function.
    }

    // Populate the colorSequence array based on colorCounts.
    // For each color (from 1 to numColors), add its index to the sequence
    // as many times as specified in colorCounts.
    for (let colorIndex = 1; colorIndex <= numColors; colorIndex++) {
        for (let countIdx = 0; countIdx < colorCounts[colorIndex - 1]; countIdx++) {
            colorSequence.push(colorIndex);
        }
    }

    // Initialize arrays to store the final grid rows and the current row being built.
    let resultRows = [];
    let currentRow = [];

    // Iterate through the generated color sequence to form grid rows.
    for (let sequenceIdx = 0; sequenceIdx < colorSequence.length; sequenceIdx++) {
        currentRow.push(colorSequence[sequenceIdx]); // Add the current color to the row.

        // Check if the current row is complete (reached widthVal)
        // and it's not the very first element.
        if (sequenceIdx !== 0 && (~~sequenceIdx + 1) % widthVal === 0) {
            // If the row index is odd (0-indexed, so (sequenceIdx / widthVal) is odd), reverse the row.
            // This creates a snake-like pattern.
            if ((sequenceIdx / widthVal) % 2 !== 0) {
                currentRow.reverse();
            }

            // Add the completed row (joined by spaces) to the result.
            resultRows.push(currentRow.join(" "));
            // Reset the current row for the next line.
            currentRow = [];
        }
    }

    // Output the final grid by joining all result rows with newlines.
    console.log(resultRows.join("\n"));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
