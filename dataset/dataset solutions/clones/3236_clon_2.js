/*
 * This script processes numerical input from standard input.
 * It performs a specific calculation and outputs two derived values.
 */
function ProcessData(rawData) {
    // Parse the incoming string: split by spaces and convert each part to a number.
    let parsedNumbers = rawData.split(" ").map(Number);

    // Calculate an intermediate value based on the first three parsed numbers.
    // The first number is subtracted from the sum of the second and third.
    let resultValue = -parsedNumbers[0] + parsedNumbers[1] + parsedNumbers[2];

    // Ensure the calculated value is non-negative; if it's less than or equal to zero, set it to zero.
    if (resultValue <= 0) {
        resultValue = 0;
    }

    // Output two values separated by a space:
    // 1. The minimum of the second and third parsed numbers.
    // 2. The adjusted calculated value.
    console.log(Math.min(parsedNumbers[1], parsedNumbers[2]) + " " + resultValue);
}

// Read the entire content from standard input, remove any leading/trailing whitespace,
// and then pass this cleaned string to the main data processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
