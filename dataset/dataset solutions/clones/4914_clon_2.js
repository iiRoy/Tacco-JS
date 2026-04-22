/*
 * This module defines a function to process a series of numerical entries
 * and perform specific calculations based on their values.
 */
let performCalculations = function(inputLines) {
    // Determine the total number of entries to process from the first line.
    let numEntries = Number(inputLines[0]);

    // Initialize two primary values that will be updated throughout the process.
    let valA = 1,
        valB = 1;

    // Iterate through each subsequent entry line, starting from the second line.
    for (let entryIndex = 1; entryIndex <= numEntries; entryIndex++) {
        /*
         * Parse the current line to extract two numerical components.
         * The values are converted to numbers explicitly.
         */
        let currentA = Number(inputLines[entryIndex].split(" ")[0]);
        let currentB = Number(inputLines[entryIndex].split(" ")[1]);

        /*
         * Apply a series of conditional logic to update valA and valB
         * based on their relationship with currentA and currentB.
         * This ensures valA and valB maintain a certain scaling property.
         */
        if (currentA >= valA && currentB >= valB) {
            // Case 1: Both current values are greater than or equal to primary values.
            // Update primary values directly with the new, larger values.
            valA = currentA;
            valB = currentB;
        } else if (valA >= currentA && valB >= currentB) {
            // Case 2: Both primary values are greater than or equal to current values.
            // Calculate scaling factors to bring primary values up proportionally.
            let scaleA = Math.ceil(valA / currentA);
            let scaleB = Math.ceil(valB / currentB);

            if (scaleA > scaleB) {
                // If the scaling factor for 'A' is larger, apply it to both components.
                valA = scaleA * currentA;
                valB = scaleA * currentB;
            } else {
                // Otherwise, apply the scaling factor for 'B' to both components.
                valA = scaleB * currentA;
                valB = scaleB * currentB;
            }
        } else if (valA >= currentA) {
            // Case 3: Only primary value 'A' is greater than or equal to current 'A'.
            // Calculate scaling factor for 'A' and apply it to both primary values.
            let scaleA = Math.ceil(valA / currentA);
            valA = scaleA * currentA;
            valB = scaleA * currentB;
        } else {
            // Case 4: Only primary value 'B' is greater than or equal to current 'B'.
            // Calculate scaling factor for 'B' and apply it to both primary values.
            let scaleB = Math.ceil(valB / currentB);
            valA = scaleB * currentA;
            valB = scaleB * currentB;
        }
    }

    // After processing all entries, log the sum of the final primary values to the console.
    console.log(valA + valB);
};

// This section handles the execution environment setup.
// It reads input from standard input, processes it, and then calls the main calculation function.
performCalculations(
    require('fs') // Import the Node.js 'fs' (file system) module.
    .readFileSync('/dev/stdin', 'utf8') // Synchronously read the content of '/dev/stdin' as a UTF-8 string.
    .trim() // Remove any leading or trailing whitespace (like a final newline).
    .split("\n") // Split the cleaned string into an array of strings, where each element is a line.
);