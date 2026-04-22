"use strict";

// This module is responsible for processing raw input data to construct a grid
// based on specified dimensions and item distribution, applying a snake-like
// pattern for row ordering.
const processInputAndGenerateGrid = (rawInputData) => {
    // Step 1: Normalize and segment the raw input string into individual lines.
    // Handles various newline conventions (CRLF, LF).
    const inputSegments = rawInputData.trim().split(/\r?\n/);

    // --- Parse Grid Dimensions (Height and Width) ---
    // The first line contains space-separated height and width.
    const [heightString, widthString] = inputSegments[0].split(" ");
    const gridHeight = parseInt(heightString, 10);
    const gridWidth = parseInt(widthString, 10);

    // Basic validation for grid dimensions.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight < 1 || gridWidth < 1) {
        console.error("Input Error: Invalid or missing grid dimensions. Height and Width must be positive integers.");
        return;
    }

    // Calculate the total number of cells in the grid.
    const totalGridCapacity = gridHeight * gridWidth;

    // --- Parse Number of Unique Items ---
    // The second line contains the count of distinct item types.
    const distinctItemCount = parseInt(inputSegments[1], 10);
    if (isNaN(distinctItemCount) || distinctItemCount < 1) {
        console.error("Input Error: Invalid or missing count for unique item types. Must be a positive integer.");
        return;
    }

    // --- Parse Individual Item Counts ---
    // The third line provides the quantity for each unique item, space-separated.
    // Item identifiers are 1-based (1, 2, 3...).
    const itemQuantities = inputSegments[2].split(" ").map(s => parseInt(s, 10));

    // Validate the parsed item quantities.
    if (itemQuantities.length !== distinctItemCount) {
        console.error(`Input Error: Mismatch between 'distinctItemCount' (${distinctItemCount}) and actual number of item quantities provided (${itemQuantities.length}).`);
        return;
    }
    if (itemQuantities.some(q => isNaN(q) || q < 0)) {
        console.error("Input Error: Some item quantities are invalid (not a number or negative).");
        return;
    }

    // --- Generate Flat Sequence of All Items ---
    // This array will contain the full sequence of items,
    // repeating each item identifier according to its quantity.
    const sequentialItemPlacement = [];
    let currentIdentifierValue = 1; // Item identifiers start from 1.
    for (const quantity of itemQuantities) {
        for (let fillIndex = 0; fillIndex < quantity; fillIndex++) {
            sequentialItemPlacement.push(currentIdentifierValue);
        }
        currentIdentifierValue++;
    }

    // Critical validation: Ensure the total number of items matches the grid's capacity.
    const totalItemsProvided = sequentialItemPlacement.length;
    if (totalItemsProvided !== totalGridCapacity) {
        console.error(`Input Error: Total items provided (${totalItemsProvided}) do not perfectly fill the grid capacity (${totalGridCapacity}).`);
        return;
    }

    // --- Construct Grid Rows with Snake Pattern ---
    const finalRenderedGrid = []; // Stores the completed grid rows as strings.
    let activeRowBuffer = [];     // Temporarily accumulates items for the current row.
    let currentRowNumber = 0;     // Keeps track of the 0-indexed row being built.

    // Iterate through the flattened sequence of items.
    for (let sequencePosition = 0; sequencePosition < sequentialItemPlacement.length; sequencePosition++) {
        const itemForCell = sequentialItemPlacement[sequencePosition];
        activeRowBuffer.push(itemForCell);

        // Check if the current row buffer has reached the grid's width.
        // This occurs when (sequencePosition + 1) is a multiple of gridWidth.
        if ((sequencePosition + 1) % gridWidth === 0) {
            // Apply the snake pattern: Reverse items for odd-indexed rows.
            // (0-indexed row number: 1st row is 0, 2nd is 1, 3rd is 2, etc.)
            if (currentRowNumber % 2 !== 0) {
                activeRowBuffer.reverse();
            }

            // Convert the numeric row into a space-separated string and add to final grid.
            finalRenderedGrid.push(activeRowBuffer.join(" "));
            
            // Reset the buffer for the next row and increment the row counter.
            activeRowBuffer = [];
            currentRowNumber++;
        }
    }

    // --- Output Final Grid ---
    // Join all constructed row strings with newline characters for final display.
    console.log(finalRenderedGrid.join("\n"));
};

// Entry point: Read input from standard input and pass it to the processing function.
processInputAndGenerateGrid(require('fs').readFileSync('/dev/stdin', 'utf8'));