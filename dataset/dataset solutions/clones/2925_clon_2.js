'use strict'; // Activate strict mode for the JavaScript script.

/*
 * This function processes incoming textual data
 * to perform a conditional numerical calculation.
 * It expects a string where the first line contains
 * two space-separated integer values.
 */
const evaluatorRoutine = (dataSource) => {

    // First, extract the initial line from the provided data source.
    // Then, split that line into an array of string components based on spaces.
    const valStrings = dataSource.split('\n')[0].split(' ');

    // Convert the first string component into a base-10 integer.
    // This value represents the primary numerical criterion.
    const primaryNum = parseInt(valStrings[0], 10);

    // Convert the second string component into a base-10 integer.
    // This value represents the secondary numerical operand.
    const secondaryNum = parseInt(valStrings[1], 10);

    // Evaluate the primary numerical criterion against different thresholds.
    if (primaryNum >= 13) {
        // If the primary criterion is high (13 or more), output the secondary operand directly.
        console.log(secondaryNum);
    }
    else if (primaryNum >= 6) {
        // If the primary criterion is moderate (between 6 and 12), output half of the secondary operand.
        console.log(secondaryNum / 2);
    }
    else {
        // If the primary criterion is low (less than 6), output a zero value.
        console.log(0);
    }

}; // End of the 'evaluatorRoutine' function definition.


// Execute the main processing routine.
// Read input from the standard input stream (typically console or piped data)
// using the Node.js file system module, decoding it as UTF-8 text.
evaluatorRoutine(require('node:fs').readFileSync('/dev/stdin', 'utf8'));