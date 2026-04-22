(function() {
    // This immediately invoked function expression (IIFE) encapsulates the script's scope.
    'use strict'; // Enforces strict parsing and error handling in the code.

    // Acquire the Node.js 'fs' (file system) module for file operations.
    const fileSystemModule = require('fs');

    // Read the entire content from standard input synchronously.
    // The '/dev/stdin' path is a common way to access standard input on Unix-like systems.
    // The 'utf-8' encoding specifies how the raw byte data should be interpreted into text.
    let inputDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');

    /**
     * Analyzes a multi-line string input to compute the minimum, maximum, and sum of a sequence of numbers.
     * The function expects the numerical data to be on the second line of the input,
     * with numbers separated by one or more spaces.
     *
     * @param {string} rawInputText - The complete string data obtained from the input source.
     * @returns {string} A string containing the calculated minimum, maximum, and sum,
     *                   formatted as "min max sum", or an error message if input is invalid.
     */
    const processNumericalSequence = function(rawInputText) {
        // Perform initial validation: check if the input is a valid non-empty string.
        if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
            return "Error: Input data is empty or not a valid string type.";
        }

        // Split the raw input into individual lines after trimming any leading/trailing whitespace.
        const inputSegments = rawInputText.trim().split('\n');

        // Verify that there are at least two lines in the input.
        // The first line is typically metadata (e.g., count of numbers),
        // and the second line contains the actual numerical sequence.
        if (inputSegments.length < 2) {
            return "Error: Insufficient input lines; expected at least two lines of data.";
        }

        // Extract the second line (index 1) which holds the space-separated numbers.
        // Use a regular expression to split by one or more whitespace characters for robustness.
        const numericalStringElements = inputSegments[1].trim().split(/\s+/);

        // An intermediate array to store numbers after successful parsing.
        const parsedNumbers = [];

        // Iterate through each string element and attempt to parse it as an integer.
        // Only valid integers are added to the `parsedNumbers` array.
        for (let j = 0; j < numericalStringElements.length; j++) {
            const currentElement = numericalStringElements[j];
            const potentialNumber = parseInt(currentElement, 10); // Specify radix 10 for safe parsing.

            // Validate if the parsed result is a number and not NaN.
            if (!isNaN(potentialNumber)) {
                parsedNumbers.push(potentialNumber);
            }
            // Non-numeric elements are silently skipped; an alternative might be to log warnings.
        }

        // After parsing, check if any valid numbers were successfully extracted.
        if (parsedNumbers.length === 0) {
            return "Error: No valid numerical values were found in the provided sequence.";
        }

        // Initialize the statistical variables with the first valid number.
        // This approach avoids using arbitrary large/small constants for min/max.
        let currentMinimum = parsedNumbers[0];
        let currentMaximum = parsedNumbers[0];
        let runningTotal = parsedNumbers[0];

        // Iterate through the remaining numbers in the `parsedNumbers` array, starting from the second element.
        for (let k = 1; k < parsedNumbers.length; k++) {
            const valueAtPosition = parsedNumbers[k];

            // Update the maximum value if the current number is greater.
            if (valueAtPosition > currentMaximum) {
                currentMaximum = valueAtPosition;
            }
            // Update the minimum value if the current number is smaller.
            // Using 'else if' here can slightly optimize by avoiding a redundant check if max was just updated.
            else if (valueAtPosition < currentMinimum) {
                currentMinimum = valueAtPosition;
            }

            // Accumulate the current number into the running sum.
            runningTotal += valueAtPosition;
        }

        // Construct the final output string using a template literal for clarity.
        return `${currentMinimum} ${currentMaximum} ${runningTotal}`;
    };

    // Execute the number processing function with the gathered input data.
    // The result (a formatted string or an error message) is then printed to standard output.
    console.log(processNumericalSequence(inputDataString));

})(); // End of the IIFE.