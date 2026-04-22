(function() {
    'use strict';

    // An array to accumulate all lines received from the standard input stream.
    let receivedTextLines = [];

    // Helper function to determine if a value is truly numeric and finite.
    const isValidNumeric = (val) => typeof val === 'number' && !isNaN(val) && isFinite(val);

    // Creates an interface to read data line by line.
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout // Output stream is not used for interactive prompts here
    })
    .on('line', (currentInputLine) => {
        // Each line read is buffered for later processing.
        receivedTextLines.push(currentInputLine);
    })
    .on('close', () => {
        // This function calculates the sum of the numerical digits within a given string.
        const calculateDigitSum = (numericString) => {
            if (typeof numericString !== 'string' || numericString.length === 0) {
                return 0; // Return zero for invalid or empty input strings.
            }

            let accumulatedSum = 0;
            for (let charIndex = 0; charIndex < numericString.length; charIndex++) {
                const char = numericString[charIndex];
                const digitValue = Number(char); // Convert character to its numeric representation.

                // Only add valid digits to the sum.
                if (isValidNumeric(digitValue)) {
                    accumulatedSum += digitValue;
                }
            }
            return accumulatedSum;
        };

        // The primary function to execute after all input has been received.
        const processInputAndEvaluate = () => {
            // Verify that at least one line of input was provided.
            if (receivedTextLines.length === 0 || !receivedTextLines[0]) {
                // If no input, log a message and exit.
                console.log("No data supplied.");
                return;
            }

            // Obtain the first line of input and extract the initial numeric token.
            // Trimming whitespace and splitting by any sequence of spaces ensures robustness.
            const firstInputToken = receivedTextLines[0].trim().split(/\s+/)[0];

            // Validate the extracted token.
            if (!firstInputToken || firstInputToken.length === 0) {
                console.log("Empty or invalid numeric token detected.");
                return;
            }

            // Convert the string token into a proper number.
            const mainNumericValue = Number(firstInputToken);

            // Check for successful conversion to a number.
            if (!isValidNumeric(mainNumericValue)) {
                console.log("Input could not be converted to a valid number.");
                return;
            }

            // Compute the sum of digits for the initial numeric token.
            const totalOfDigits = calculateDigitSum(firstInputToken);

            // Handle the special case where the sum of digits is zero to prevent division by zero errors.
            if (totalOfDigits === 0) {
                // If the main number is also zero, it's considered divisible. Otherwise, not.
                console.log(mainNumericValue === 0 ? "Yes" : "No");
                return;
            }

            // Calculate the remainder when the main number is divided by its digit sum.
            const divisionRemainder = mainNumericValue % totalOfDigits;

            // Based on the remainder, determine if it's perfectly divisible.
            const isDivisibleByDigitSum = (divisionRemainder === 0);

            // Output the final result.
            if (isDivisibleByDigitSum) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };

        // Initiate the processing of the collected input.
        processInputAndEvaluate();
    });

})();