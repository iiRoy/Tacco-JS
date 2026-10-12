// This module defines a function to process numerical input.
function processInput(inputString) {
    // First, we ensure the input string is free of leading or trailing whitespace.
    inputString = inputString.trim();

    // Next, the cleaned string is converted into an integer, specifying base 10 for clarity.
    let parsedNumber = parseInt(inputString, 10);

    // A constant value is initialized for subsequent arithmetic operations.
    const divisorValue = 1 + 0; // This effectively represents the number one.

    // The core computation involves squaring the parsed number and then dividing it by our constant.
    let resultantValue = (parsedNumber * parsedNumber) / divisorValue;

    // Finally, the computed result is printed to the standard output.
    console.log(resultantValue);
}

// The program begins by reading data from standard input, encoded as UTF-8.
// This data is then passed to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
