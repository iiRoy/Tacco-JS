function executeProgram(inputData) {
    const parsedLines = inputData.split("\n");
    const targetValue = parseInt(parsedLines[0], 10);

    // The upper limit for 'i' in the original loop
    const iterationLimit = 1000000000; // Represents 10^9

    // Function to convert a decimal number to its base -2 representation.
    // This directly generates the binary string 'S' such that
    // S[0]*(-2)^0 + S[1]*(-2)^1 + ... = decimalNumber.
    // The string is built from least significant bit (coefficient of (-2)^0)
    // to most significant bit.
    function generateNegabaseString(decimalNumber) {
        if (decimalNumber === 0) {
            return '0';
        }
        let negabaseDigits = '';
        let currentNumber = decimalNumber;
        while (currentNumber !== 0) {
            // Calculate the current digit (0 or 1)
            let digit = currentNumber % 2;
            // Prepend the digit to build the string from LSB to MSB
            negabaseDigits = digit.toString() + negabaseDigits;
            // Calculate the next number for the next iteration
            currentNumber = Math.floor((currentNumber - digit) / -2);
        }
        return negabaseDigits;
    }

    // Directly compute the negabase representation for the target value.
    // This string corresponds to `num2` in the original code.
    const negabaseConversion = generateNegabaseString(targetValue);

    // Convert this negabase string to its standard base-2 integer value.
    // This represents the `i` value in the original code's loop.
    const equivalentBinaryValue = parseInt(negabaseConversion, 2);

    let finalResultString;

    // Check if the calculated 'i' (equivalentBinaryValue) falls within the
    // search range of the original code's loop (0 to iterationLimit - 1).
    if (equivalentBinaryValue < iterationLimit) {
        // If it's within range, the original code outputs the `num2` string reversed.
        // `num2` is `negabaseConversion` here.
        finalResultString = negabaseConversion.split('').reverse().join('');
    } else {
        // If the targetValue's negabase representation corresponds to an 'i'
        // outside the original loop's range, the original code would not find it.
        // In such a scenario, the original code outputs the reversed binary string
        // of the last value of 'i' it checked, which is (iterationLimit - 1).
        finalResultString = (iterationLimit - 1).toString(2).split('').reverse().join('');
    }

    // Print the computed result to standard output.
    console.log(finalResultString);
}

// Read input from standard input and execute the program.
executeProgram(require('fs').readFileSync(0, 'utf8'));