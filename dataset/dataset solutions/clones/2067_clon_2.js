"use strict"; // Enforce strict parsing and error handling in the script.

  // This core routine processes incoming data to produce a specific output.
const executeTask = (inputContent) => {
    // Pre-process the raw input: trim leading/trailing whitespace and split into individual lines.
    inputContent = inputContent.trim().split("\n");

    /*
     * Parse the first numerical component from the first line of the processed input.
     * This extracted number serves as an index or key for subsequent data access.
     */
    const lookupKey = parseInt(inputContent[0].split(" ")[0]);

    // Declare a static sequence of numerical values for reference.
    const numericSeries = [ 1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51 ];

    // Print the value located at the calculated position within the predefined numerical series.
    console.log(numericSeries[lookupKey - 1]);
};

// Initiate the task by reading the standard input stream and passing its content to the main processing function.
executeTask(require('fs').readFileSync('/dev/stdin', 'utf8'));