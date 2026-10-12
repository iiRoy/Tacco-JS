(function (rawData) {
    // This function processes input data to calculate change using a greedy algorithm.
    // It reads lines, parses numbers, and determines the minimum number of "coins"
    // needed to reach 1000 from the given number.

    // Prepare the input: remove carriage returns and split into an array of lines.
    let processedLines = rawData.replace(/\r/g, '').split("\n");

    let currentValue; // Represents the current number read from input.
    let remainingAmount; // Represents the amount left to reach 1000.
    let operationCounter; // Counts the number of operations (coin deductions).

    // Main processing loop. Continues until a '0' is encountered.
    while (true) {
        operationCounter = 0; // Reset the counter for each new input value.

        // Get the next line, parse it as an integer, and store it.
        currentValue = parseInt(processedLines.shift());

        // If the parsed value is 0, it's the termination signal.
        if (currentValue === 0) {
            break; // Exit the main loop.
        }

        // Calculate the amount that needs to be "changed" from 1000.
        remainingAmount = 1000 - currentValue;

        // Inner loop: Deduct "coins" from the remaining amount until it reaches zero.
        while (remainingAmount !== 0) {
            // Prioritize larger denominations.
            if (remainingAmount % 500 === 0) {
                remainingAmount -= 500;
            } else if (remainingAmount % 100 === 0) {
                remainingAmount -= 100;
            } else if (remainingAmount % 50 === 0) {
                remainingAmount -= 50;
            } else if (remainingAmount % 10 === 0) {
                remainingAmount -= 10;
            } else if (remainingAmount % 5 === 0) {
                remainingAmount -= 5;
            } else if (remainingAmount % 1 === 0) { // This condition is always true for integers.
                remainingAmount -= 1;
            }
            operationCounter++; // Increment the counter for each deduction.
        }
        // Output the total number of operations for the current input.
        console.log(operationCounter);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Immediately invoked function expression (IIFE)
// It reads the entire content of standard input as a UTF-8 string.
