"use strict";

// This function processes the incoming raw data
const processInput = rawData => {
    // Split the raw data into individual lines after trimming
    const lineSegments = rawData.trim().split('\n');

    // Parse the first line as an integer, representing the total count of items
    const countOfItems = parseInt(lineSegments[0], 10);

    // Split the second line by spaces to get an array of item colors
    const itemColors = lineSegments[1].split(' ');

    // Initialize a counter for modifications needed
    let modifications = 0;

    // Iterate through the item colors, stopping one element before the end
    for (let idx = 0; idx < countOfItems - 1; idx++) {
        // Check if the current color is identical to the next color
        if (itemColors[idx] === itemColors[idx + 1]) {
            // If they are the same, increment the modification counter
            modifications++;
            // Skip the next element as it was already considered (and is identical)
            idx++;
        }
    }
    // Output the total number of modifications required
    console.log(modifications);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
