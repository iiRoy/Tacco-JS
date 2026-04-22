(() => {
    // Enable strict mode for secure and clean code execution.
    'use strict';

    // Import the Node.js file system module, renaming it for clarity.
    const ioProvider = require('fs');

    // Read all input data from the standard input stream, assuming UTF-8 encoding.
    // This will be the raw text that needs parsing.
    let rawInputData = ioProvider.readFileSync('/dev/stdin', 'utf8');

    /**
     * @function analyzeNumericSequence
     * @description Processes a multi-line string containing numbers to find the minimum, maximum, and sum.
     *              The first line is expected to contain the count of numbers (though not used in calculation),
     *              and the second line contains space-separated numbers.
     * @param {string} sourceText - The input string containing numeric data.
     */
    const analyzeNumericSequence = function(sourceText) {
        // Trim leading/trailing whitespace from the input and split it into individual lines.
        let textLines = sourceText.trim().split("\n");

        // Parse the first line to get the total count of elements.
        // This variable is declared but not utilized in subsequent logic,
        // mirroring the original implementation's behavior.
        const itemCount = Number.parseInt(textLines[0].trim(), 10);

        // Extract the second line, trim it, and split it by spaces to get an array of number strings.
        const numericStrings = textLines[1].trim().split(" ");

        // Initialize variables for tracking the smallest, largest, and aggregate total.
        // These initial values ensure any valid input number will correctly update them.
        let smallestNum = 1_000_000;  // A large initial value for finding minimum
        let largestNum  = -1_000_000; // A small initial value for finding maximum
        let aggregateTotal = 0;       // Accumulator for the sum of all numbers

        // Iterate through each string representation of a number in the sequence.
        for (let idx = 0; idx < numericStrings.length; idx += 1) {
            // Convert the current string number to an integer.
            const currentNumber = Number.parseInt(numericStrings[idx], 10);

            // Check if the current number is greater than the current maximum.
            if (currentNumber > largestNum) {
                largestNum = currentNumber; // Update the maximum value.
            }

            // Check if the current number is smaller than the current minimum.
            if (currentNumber < smallestNum) {
                smallestNum = currentNumber; // Update the minimum value.
            }

            // Add the current number to the running total.
            aggregateTotal += currentNumber;
        }

        // Output the calculated minimum, maximum, and sum to the console,
        // separated by spaces as per the problem specification.
        console.log(smallestNum + " " + largestNum + " " + aggregateTotal);
    };

    // Invoke the main analysis function with the data read from standard input.
    analyzeNumericSequence(rawInputData);
})();