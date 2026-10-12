function ProcessInput(rawData) {
    // This variable will store the integer value parsed from the input string.
    let numberValue = parseInt(rawData, 10);

    /**
     * Computes the sum of the individual digits of a given numerical value.
     * @param {number} numToProcess - The number for which to calculate the digit sum.
     * @returns {number} The total sum of its digits.
     */
    function calculateDigitSum(numToProcess) {
        // First, convert the number into its string representation.
        // Then, split the string into an array of individual character digits.
        // Finally, map each character digit back to an integer.
        const digitArray = numToProcess.toString().split('').map(digitChar => parseInt(digitChar, 10));
        
        // Use the reduce method to sum all the integers in the array.
        return digitArray.reduce((accumulator, currentDigit) => accumulator + currentDigit);
    }

    // Check if the main number is perfectly divisible by the sum of its own digits.
    if (numberValue % calculateDigitSum(numberValue) === 0) {
        // If the condition is met, output 'Yes' to the console.
        console.log('Yes');
    } else {
        // Otherwise, if the condition is not met, output 'No'.
        console.log('No');
    }
}

// Read the entire content of the standard input file synchronously,
// using UTF-8 encoding, and then pass it to our main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
