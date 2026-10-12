function ProcessData(incomingText) {
    // This function processes a string of space-separated numbers.
    // It checks specific conditions on these numbers and prints a result.
    const numericValues = incomingText.trim().split(' ').map(Number);

    // Evaluate a compound condition:
    // The first part (!numericValues[0] <= 9) is always true for non-negative numbers.
    // The second part (numericValues[1] <= 9) checks if the second number is 9 or less.
    if (!numericValues[0] <= 9 && numericValues[1] <= 9) {
        // If the conditions are met, calculate and display the product of the two numbers.
        console.log(numericValues[0] * numericValues[1]);
    } else {
        // Otherwise, output a specific error indicator.
        console.log('-1');
    }
}

/*
// Example usage for local testing (commented out):
const sampleInputString = `6 12`;
ProcessData(sampleInputString);
*/

// Read input from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
