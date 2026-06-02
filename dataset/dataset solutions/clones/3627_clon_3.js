function processInput(rawInput) {
    const inputLines = rawInput.split("\n");
    const targetDecimalValue = parseInt(inputLines[0], 10);

    const MAX_ITERATIONS_LIMIT = 1000000000; // Represents Math.pow(10, 9)

    let currentBinaryRepresentation = ''; // Will hold the binary string of the current number
    let calculatedNegativeBaseValue = 0; // Value calculated in base -2

    // Helper function to reverse a string
    const reverseString = (strToReverse) => {
        return strToReverse.split("").reverse().join("");
    };

    for (let currentDecimalValue = 0; currentDecimalValue < MAX_ITERATIONS_LIMIT; currentDecimalValue++) {
        currentBinaryRepresentation = currentDecimalValue.toString(2); // Convert current number to binary string

        calculatedNegativeBaseValue = 0; // Reset for each new binary string
        let currentPowerOfNegativeTwo = 1; // Starts at (-2)^0 = 1

        // Iterate through each bit of the binary string
        for (let bitPosition = 0; bitPosition < currentBinaryRepresentation.length; bitPosition++) {
            // If the bit is '1', add the corresponding power of -2
            if (currentBinaryRepresentation[bitPosition] === '1') {
                calculatedNegativeBaseValue += currentPowerOfNegativeTwo;
            }
            // Update the power of -2 for the next bit position
            currentPowerOfNegativeTwo *= -2;
        }

        // Check if the calculated value matches the target
        if (calculatedNegativeBaseValue === targetDecimalValue) {
            break; // Exit the loop if a match is found
        }
    }

    // The variable `currentBinaryRepresentation` will hold the binary string
    // that either caused the loop to break (a match was found) or the last
    // binary string processed if no match was found (i.e., for MAX_ITERATIONS_LIMIT - 1).
    // This preserves the exact observable behavior of the original code.
    console.log(reverseString(currentBinaryRepresentation));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
