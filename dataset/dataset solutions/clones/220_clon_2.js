// This routine calculates the greatest common divisor (GCD) of two integer values
function greatestCommonDivisor(firstNum, secondNum) {
    // Identify the larger and smaller of the two provided numerical inputs
    let largerValue = Math.max(firstNum, secondNum);
    let smallerValue = Math.min(firstNum, secondNum);

    // Implement the Euclidean algorithm: repeatedly replace the larger number
    // with the remainder of the division until the smaller number becomes zero.
    while (smallerValue !== 0) {
        // Temporarily store the current smaller value before it's updated
        const temporaryHold = smallerValue;
        // Calculate the remainder when the larger value is divided by the smaller value
        smallerValue = largerValue % smallerValue;
        // Update the larger value with the previously stored smaller value
        largerValue = temporaryHold;
    }
    // The larger value now holds the GCD
    return largerValue;
}

// Utilize Node.js 'fs' module to synchronously read the entire content
// from standard input, interpreting it as UTF-8 encoded text.
const fileSystemModule = require('fs');
let dataContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the obtained data: remove any leading/trailing whitespace,
// then divide the content into an array of strings, using newline characters as separators.
let inputLines = dataContent.trim().split("\n");

// Iterate sequentially through each line present in the processed input array
for (let currentLinePosition = 0; currentLinePosition < inputLines.length; currentLinePosition++) {
    // For the current line, split it by spaces and transform each resulting
    // substring into a numerical value, storing them in an array.
    const numericValues = inputLines[currentLinePosition].split(" ").map(Number);

    // Compute the GCD for the first two numerical elements from the current line.
    const calculatedGCD = greatestCommonDivisor(numericValues[0], numericValues[1]);

    // Determine a specific ratio: (first_number / GCD) divided by (second_number / GCD).
    // This simplifies the fraction to its lowest terms and then calculates the decimal value.
    const ratioResult = (numericValues[0] / calculatedGCD) / (numericValues[1] / calculatedGCD);

    // Extract the third numerical element from the line, which dictates the number of loop iterations.
    let loopIterations = numericValues[2];

    // Initialize a variable to accumulate the sum of digits found during the loop.
    let accumulatedSum = 0;

    // Execute a loop based on the 'loopIterations' count, decrementing it in each cycle.
    while (loopIterations--) {
        // Convert the 'ratioResult' to a string with a fixed number of decimal places.
        // The number of decimal places is determined by (current loopIterations + 2).
        // Then, extract the last two characters of this formatted string.
        const twoDigitSuffix = (ratioResult.toFixed(loopIterations + 2)).slice(-2);

        // Take the first character of the extracted two-digit suffix, convert it to a number,
        // and add it to the running accumulated sum.
        accumulatedSum += (twoDigitSuffix[0] - 0);
    }
    // Output the final computed accumulated sum for the current input line to the console.
    console.log(accumulatedSum);
}