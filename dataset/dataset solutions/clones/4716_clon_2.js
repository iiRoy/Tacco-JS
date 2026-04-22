'use strict'; // Enforce strict mode for cleaner code and fewer errors

const displayMessage = (outputString) => { // Utility function to print messages to the console
    console.log(outputString);
};

// Read all input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines
const sourceDataLines = require("fs").readFileSync("/dev/stdin", "utf8")
                                    .trim()
                                    .split('\n');

// Parse the dimensions for the primary matrix and the pattern matrix from the first line of input
const mainGridSize = Number(sourceDataLines[0].split(' ')[0]), // The 'N' dimension for the larger grid
      patternSize = Number(sourceDataLines[0].split(' ')[1]),   // The 'M' dimension for the smaller pattern
      primaryGrid = sourceDataLines.slice(1, 1 + mainGridSize) // Extract lines representing the main matrix
                                   .map(lineContent => lineContent.split('')), // Convert each line string into an array of characters
      comparisonPattern = sourceDataLines.slice(1 + mainGridSize, 1 + mainGridSize + patternSize) // Extract lines for the pattern matrix
                                            .map(lineContent => lineContent.split('')); // Convert each pattern line into a character array

// Iterate through all potential top-left coordinates in the primary grid where the pattern could possibly start
for (let mainRowIdx = 0; mainRowIdx <= mainGridSize - patternSize; mainRowIdx++) {
    for (let mainColIdx = 0; mainColIdx <= mainGridSize - patternSize; mainColIdx++) {
        // Optimization: Check if the very first character of the pattern matches the current primary grid character
        if (primaryGrid[mainRowIdx][mainColIdx] === comparisonPattern[0][0]) {
            let potentialMatch = true; // Flag to indicate if the current placement is a match

            // Compare the pattern matrix with the corresponding sub-section of the primary grid
            for (let patternRowOffset = 0; patternRowOffset < patternSize; patternRowOffset++) {
                for (let patternColOffset = 0; patternColOffset < patternSize; patternColOffset++) {
                    // Check if the current character in the primary grid matches the corresponding pattern character
                    if (primaryGrid[mainRowIdx + patternRowOffset][mainColIdx + patternColOffset] === comparisonPattern[patternRowOffset][patternColOffset]) {
                        // Characters match, continue to the next comparison
                        continue;
                    } else {
                        // Mismatch found: this specific placement of the pattern is not correct
                        potentialMatch = false;
                        break; // Exit the inner column loop immediately
                    }
                }
                // If a mismatch was found in the column loop, then this row placement is invalid, no need to check further rows
                if (!potentialMatch) { /* This conditional break was NOT in the original code,
                                        * so it is omitted here to preserve identical control flow.
                                        * The `potentialMatch` flag correctly handles this. */ }
            }

            // If the `potentialMatch` flag is still true after all comparisons, the pattern has been found
            if (potentialMatch) {
                console.log('Yes'); // Output the success message
                process.exit();     // Terminate the execution of the script
            }
        }
    }
}

// If the entire search completes without finding the pattern, output 'No'
console.log('No');