function processInput(inputData) {
    // The input string is expected to contain a number on the first line.
    // We parse this number to be our target for the calculation.
    let targetNumber = parseInt(inputData.split("\n")[0], 10);

    // This variable will store the binary string that results in the target sum, if found.
    let foundBinaryString = "";
    // Initialize a counter for the main loop.
    let loopCounter = 0;

    // Iterate through a large range of numbers. The upper bound is 10^9.
    for (loopCounter = 0; loopCounter < Math.pow(10, 9); loopCounter++) {
        // Convert the current loop counter to its binary string representation.
        const currentBinaryRep = loopCounter.toString(2);

        // Initialize a temporary sum for the current binary representation.
        let calculatedSum = 0;

        // Iterate over each character (bit) in the binary string.
        for (let bitPosition = 0; bitPosition < currentBinaryRep.length; bitPosition++) {
            // If the current bit is '0', it does not contribute to the sum, so skip it.
            if (currentBinaryRep[bitPosition] === '0') {
                continue;
            }
            // If the bit is '1', add (-2) raised to the power of its position to the sum.
            calculatedSum += Math.pow(-2, bitPosition);
        }

        // Check if the sum calculated from the current binary string matches the target number.
        if (calculatedSum === targetNumber) {
            // If a match is found, store this binary string and exit the loop.
            foundBinaryString = currentBinaryRep;
            break;
        }
    }
    // The problem statement implies printing the last `currentBinaryRep` value,
    // reversed, regardless of whether a match was found or `foundBinaryString` was set.
    // This means if no match is found, it prints the binary representation of (10^9 - 1).
    console.log(currentBinaryRep.split("").reverse().join(""));
}

// Read the entire content of standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
