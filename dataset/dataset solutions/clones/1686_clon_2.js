function calculateRemainder(inputValue = "") {
    // This function determines the amount needed to reach the next multiple of 1000.
    // It takes an input value, converts it to a number, and calculates the remainder.

    let numericValue = 0 | inputValue; // Convert input to an integer using bitwise OR.
    let remainderResult = numericValue % 1000; // Calculate the remainder when divided by 1000.

    if (remainderResult > 0) {
        // If there's a positive remainder, calculate the difference to the next 1000.
        return 1000 - remainderResult;
    } else {
        // If the remainder is zero (i.e., it's a multiple of 1000), return 0.
        return 0;
    }
}

/*
 * Export the primary calculation function for external use.
 */
exports.main = calculateRemainder;

function executeProgram(programInput) {
    // This wrapper function processes the raw input and prints the result.
    // It trims whitespace from the input before passing it to the main logic.
    console.log(calculateRemainder(programInput.trim()));
}

// Check if the script is being run directly and not in a test environment.
if (process.argv[2] !== "test") {
    // If not in test mode, read from standard input and execute the program.
    executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
}
