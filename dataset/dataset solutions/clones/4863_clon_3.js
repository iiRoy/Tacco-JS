// This module is designed to identify specific keywords within a grid-like text structure.
// It parses input data to determine grid dimensions and then scans each row for a target word.
// Upon finding the target word, it logs its grid coordinates in a specialized format (e.g., B3 for column B, row 3).
function ProcessGridData(sourceText) {
    // Ensure the input string is clean of leading/trailing whitespace.
    const cleanedSource = sourceText.trim();

    // Early exit if the input is unexpectedly short or empty.
    if (!cleanedSource || cleanedSource.length < 5) { // Arbitrary small length check for initial validation
        console.error("Input data is insufficient or empty. Cannot process grid.");
        return; // Exit the function gracefully.
    }

    // Define the set of characters used for column labeling (A, B, C...).
    const columnIdentifierMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Initialize an array to store the identified locations.
    let locationMarkers = [];

    // The target word we are searching for in the grid.
    const searchTarget = "snuke";

    // Split the entire input into individual lines.
    const allInputLines = cleanedSource.split('\n');

    // Extract grid dimensions from the first line.
    // The first line typically contains "H W" (Height Width).
    const dimensionLineParts = allInputLines[0].split(' ');

    // Validate if dimension parts exist and are correctly formatted.
    if (dimensionLineParts.length < 1 || isNaN(Number(dimensionLineParts[0]))) {
        console.error("Dimension line is malformed or missing grid height. Expected 'H W'.");
        return;
    }

    // Convert the height string to a numerical value.
    const gridRowCount = Number(dimensionLineParts[0]);
    // The original problem parsed the width (W) but never utilized it.
    // For a Type III clone, we'll remove this unused parsing to simplify and optimize.
    // const gridColCount = Number(dimensionLineParts[1]); // This line is intentionally removed.

    // Loop through each row of the grid, starting from the first data row (index 1 in allInputLines).
    // The problem statement typically uses 1-based indexing for rows.
    for (let currentGridRow = 1; currentGridRow <= gridRowCount; ++currentGridRow) {
        // Ensure we don't try to access lines beyond the available input.
        if (currentGridRow >= allInputLines.length) {
            console.warn(`Attempted to access row ${currentGridRow} but only ${allInputLines.length - 1} data rows are available. Stopping.`);
            break; // Stop processing if input lines run out.
        }

        // Get the words for the current grid row.
        const rowWords = allInputLines[currentGridRow].split(' ');

        // Check if the current row is empty or malformed.
        if (rowWords.length === 0 || (rowWords.length === 1 && rowWords[0] === '')) {
            console.warn(`Row ${currentGridRow} appears empty or malformed. Skipping.`);
            continue; // Move to the next row.
        }

        // Iterate through each word in the current row to find the target.
        // The problem statement typically uses 1-based indexing for columns.
        for (let currentWordIndex = 1; currentWordIndex <= rowWords.length; ++currentWordIndex) {
            // Access the word using 0-based indexing for the array.
            const wordToCheck = rowWords[currentWordIndex - 1];

            // Perform a strict equality check against the target word.
            if (wordToCheck === searchTarget) {
                // If the target is found, append its coordinates to our results.
                // Column is identified by a letter (A, B, C...), row by its number.
                const colLabel = columnIdentifierMap[currentWordIndex - 1];
                if (colLabel) { // Ensure a valid column label was found (i.e., not out of bounds of A-Z)
                    locationMarkers.push(colLabel + currentGridRow);
                } else {
                    console.warn(`Column index ${currentWordIndex} is out of alphabetical bounds for 'A-Z'. Skipping coordinate.`);
                }
            }
        }
    }

    // After processing all rows, join the collected location markers into a single string.
    const finalOutputString = locationMarkers.join('');

    // Display the final result to the console.
    console.log(finalOutputString);
}

// The entry point for execution, typically reading from standard input in competitive programming environments.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));