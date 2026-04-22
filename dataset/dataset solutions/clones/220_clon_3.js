// Function to determine the greatest common divisor of two non-negative integers
// using the Euclidean algorithm.
function computeCommonDivisor(firstOperand, secondOperand) {
    // Input validation: Ensure operands are numbers. For this clone, we'll primarily
    // focus on positive integers, but using Math.abs provides some robustness for negative inputs.
    // A more comprehensive solution might throw errors for non-numeric inputs.

    let currentDividend = Math.abs(firstOperand); // Work with absolute values
    let currentDivisor = Math.abs(secondOperand); // to handle potential negative inputs gracefully

    // Ensure currentDividend is always greater than or equal to currentDivisor for
    // the standard Euclidean algorithm loop. If not, swap them.
    if (currentDivisor > currentDividend) {
        // Swap values using array destructuring for conciseness and efficiency.
        [currentDividend, currentDivisor] = [currentDivisor, currentDividend];
    }

    // The Euclidean algorithm: repeatedly replace the larger number with the remainder
    // of the division of the two numbers until the remainder becomes zero.
    // The GCD is the value of currentDividend when currentDivisor is 0.
    while (currentDivisor !== 0) { // Loop continues as long as the divisor is not zero.
        // Calculate the remainder of the division.
        const remainder = currentDividend % currentDivisor;
        // Update the numbers for the next iteration:
        // The previous divisor becomes the new dividend.
        currentDividend = currentDivisor;
        // The remainder becomes the new divisor.
        currentDivisor = remainder;
    }

    // When the loop terminates, currentDivisor is 0, and currentDividend holds the GCD.
    return currentDividend;
}

// Import the Node.js File System module.
const fileSystem = require('fs');

// Define the standard input path as a constant for clarity and potential reusability.
const STDIN_SOURCE_PATH = '/dev/stdin';

// Variable to store the raw input data read from the file system.
let rawFileSystemData;

try {
    // Attempt to read the entire content of the standard input synchronously.
    // Using 'utf8' encoding to properly handle text data.
    rawFileSystemData = fileSystem.readFileSync(STDIN_SOURCE_PATH, 'utf8');
} catch (errorReadingFile) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message and terminate the process with an error code.
    console.error("Error reading input from", STDIN_SOURCE_PATH, ":", errorReadingFile.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Process the raw input: first, remove any leading/trailing whitespace,
// then split the content into an array of individual lines.
const processedInputLines = rawFileSystemData.trim().split('\n');

// Check if there's any actual data to process after trimming and splitting.
// This handles cases where the input file is empty or contains only whitespace.
if (processedInputLines.length === 0 || (processedInputLines.length === 1 && processedInputLines[0].trim() === '')) {
    console.warn("No valid input lines found for processing. Exiting gracefully.");
    process.exit(0); // Exit cleanly if no input.
}

// Iterate over each line of the processed input data.
// Using a `for...of` loop for cleaner iteration over array elements.
for (const currentLineContent of processedInputLines) {
    // Skip any lines that are empty or contain only whitespace to prevent parsing errors.
    if (!currentLineContent.trim()) {
        continue; // Move to the next line in the input.
    }

    // Parse the numbers from the current line.
    // Each line is expected to contain three space-separated numeric values.
    const numericComponents = currentLineContent.split(' ').map(valueString => {
        const parsedNumber = Number(valueString);
        // Basic validation: ensure each parsed value is a valid number.
        if (isNaN(parsedNumber)) {
            // If a non-numeric value is found, throw an error to halt processing for this line.
            throw new Error(`Invalid number encountered in line: "${currentLineContent}" (Value: "${valueString}")`);
        }
        return parsedNumber;
    });

    // Validate that exactly three numeric components were found on the line.
    // If not, log an error and skip to the next line to avoid further processing issues.
    if (numericComponents.length !== 3) {
        console.error(`Skipping line due to incorrect number of values (expected 3, found ${numericComponents.length}): "${currentLineContent}"`);
        continue; // Proceed to process the next line of input.
    }

    // Extract the three numeric values into clearly named constants for readability.
    const firstValue = numericComponents[0];
    const secondValue = numericComponents[1];
    const originalIterationCount = numericComponents[2]; // This value determines the loop iterations.

    // Calculate the greatest common divisor of the first two values using our function.
    const greatestDivisor = computeCommonDivisor(firstValue, secondValue);

    // Calculate the simplified ratio of the two values.
    // The original expression `(arr[0]/gcd)/(arr[1]/gcd)` simplifies directly to `arr[0]/arr[1]`.
    // The division by GCD in both numerator and denominator cancels out, so we calculate directly.
    const simplifiedRatioValue = firstValue / secondValue;

    // Initialize an accumulator variable for the sum of extracted digits.
    let accumulatedDigitSum = 0;

    // Loop a specified number of times (determined by `originalIterationCount`)
    // to extract and sum specific decimal digits from the `simplifiedRatioValue`.
    // The original `while (n--)` loop, with `toFixed(n+2)`, meant the `toFixed` argument
    // decreased from `originalIterationCount + 1` down to `2`.
    // In this `for` loop, `iterationIndex` goes from `0` to `originalIterationCount - 1`.
    // The equivalent `toFixed` argument is `originalIterationCount - iterationIndex + 1`.
    for (let iterationIndex = 0; iterationIndex < originalIterationCount; iterationIndex++) {
        // Determine the precision required for `toFixed` in the current iteration.
        // This precision dictates which decimal digit will be extracted.
        const targetDecimalPrecision = originalIterationCount - iterationIndex + 1;

        // Convert the simplified ratio to a fixed-point string representation
        // with the calculated precision. E.g., 1/3 with precision 4 becomes "0.3333".
        const fixedPointRepresentation = simplifiedRatioValue.toFixed(targetDecimalPrecision);

        // Extract the last two characters of the fixed-point string.
        // For "0.3333", this would be "33". This is because the original logic
        // used `slice(-2)` and then took the first character of that result.
        // This effectively gets the digit at `targetDecimalPrecision - 1` position.
        const lastTwoCharactersFromFixedString = fixedPointRepresentation.slice(-2);

        // Get the specific digit character. The original logic `str[0]` implies
        // taking the first of the two last characters.
        const digitToSumCharacter = lastTwoCharactersFromFixedString[0];

        // Convert the character digit to a number and add it to the running sum.
        // `Number()` is used for explicit type conversion, which is clearer than `char - 0`.
        accumulatedDigitSum += Number(digitToSumCharacter);
    }

    // Output the final accumulated sum of digits for the current line's input.
    console.log(accumulatedDigitSum);
}