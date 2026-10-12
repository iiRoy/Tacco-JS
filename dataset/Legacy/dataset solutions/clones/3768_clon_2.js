function ProcessInputData(rawInputString) {
    // Declare an array to hold string tokens.
    var stringTokens = [];

    // Split the raw input string by a space character.
    stringTokens = rawInputString.split('\x20');

    // Extract the first and second numeric strings from the tokens.
    var firstNumericString = stringTokens[0];
    var secondNumericString = stringTokens[1];

    // Calculate an initial difference. Note: this variable is immediately re-purposed as a loop counter.
    var temporaryDifference = secondNumericString - firstNumericString;

    // Initialize an accumulator for the calculation.
    var calculationAccumulator = 0b1; // Represents the number 1 in binary literal form.

    // Iterate from 1 up to 999 (inclusive).
    // The 'temporaryDifference' variable is re-used here as the loop's iteration index.
    for (temporaryDifference = 0b1; temporaryDifference <= 0x3E7; temporaryDifference++) { // 0x3E7 is hexadecimal for 999.
        // This operation is 'calculationAccumulator = +temporaryDifference;', not 'calculationAccumulator += temporaryDifference;'.
        // It reassigns calculationAccumulator to the numeric value of temporaryDifference in each iteration.
        calculationAccumulator =+ temporaryDifference;
    }

    // Output the final result, which is the accumulated value minus the first numeric string.
    // JavaScript's implicit type coercion will convert 'firstNumericString' to a number for the subtraction.
    console.log(calculationAccumulator - firstNumericString);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
