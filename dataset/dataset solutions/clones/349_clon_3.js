/**
 * Executes an arbitrary-precision addition for two non-negative numbers.
 * This function handles sums that might exceed JavaScript's standard number precision.
 * @param {number | string} firstOperand - The first number to add.
 * @param {number | string} secondOperand - The second number to add.
 * @returns {string} The sum of the two numbers as a string.
 */
function performLargeSum(firstOperand, secondOperand) {
    // Convert inputs to string representations to process digit by digit.
    const num1Str = String(firstOperand);
    const num2Str = String(secondOperand);

    // Transform string numbers into arrays of digits, reversing them
    // to facilitate addition from the least significant digit (right-to-left).
    // Example: "123" becomes [3, 2, 1]
    const digitsArray1 = Array.from(num1Str, Number).reverse();
    const digitsArray2 = Array.from(num2Str, Number).reverse();

    const sumDigitsResult = []; // This array will store the resulting digits in reversed order.
    let currentCarryOver = 0; // Tracks any carry-over value from the previous digit position.

    // Determine the maximum length among the two digit arrays.
    // The loop will run at least this many times, plus one extra iteration if there's a final carry.
    const maxLength = Math.max(digitsArray1.length, digitsArray2.length);

    // Iterate through each digit position, starting from the least significant.
    // The loop continues as long as there are digits to process from either number
    // or if a carry-over still needs to be handled.
    for (let position = 0; position < maxLength || currentCarryOver > 0; position++) {
        // Retrieve the digit from each number at the current position.
        // If a number is shorter, default its digit to 0 for that position.
        const digitFromNum1 = position < digitsArray1.length ? digitsArray1[position] : 0;
        const digitFromNum2 = position < digitsArray2.length ? digitsArray2[position] : 0;

        // Calculate the sum for the current digit position, including any carry-over.
        let localDigitSum = digitFromNum1 + digitFromNum2 + currentCarryOver;

        // The current digit of the sum is the remainder after division by 10.
        sumDigitsResult.push(localDigitSum % 10);

        // The new carry-over for the next position is the quotient from the division by 10.
        currentCarryOver = Math.floor(localDigitSum / 10);
    }

    // Reversing the sumDigitsResult array restores the correct order of digits,
    // then joining them creates the final sum as a string.
    return sumDigitsResult.reverse().join('');
}

// --- Main application logic for processing input equations ---

/**
 * Reads input data from a specified file path. Includes basic error handling.
 * @param {string} filePath - The path to the input file (e.g., '/dev/stdin').
 * @returns {string} The content of the file as a string, or an empty string on error.
 */
const retrieveInputData = (filePath) => {
    try {
        // Dynamically import 'fs' to avoid global pollution and for clarity.
        const fileSystem = require('fs');
        return fileSystem.readFileSync(filePath, 'utf8');
    } catch (readError) {
        // Log an error if the file cannot be read. In some contexts,
        // one might re-throw or provide a more sophisticated fallback.
        console.error(`Failed to retrieve input from '${filePath}': ${readError.message}`);
        return ''; // Return an empty string to prevent further processing of non-existent data.
    }
};

/**
 * Processes a single equation line to find the unique digit 'X' that satisfies it.
 * @param {string} equationTextLine - A string representing an equation (e.g., "1X+2=13").
 * @returns {string} The digit 'X' if a unique solution is found, otherwise "NA".
 */
const determineXSolution = (equationTextLine) => {
    // Define a regular expression to parse the equation into its three distinct parts:
    // the first term, the second term, and the expected sum.
    const equationParsingPattern = /([\dX]+)\+([\dX]+)=([\dX]+)/;
    const matchResult = equationTextLine.match(equationParsingPattern);

    // Validate if the equation line matches the expected format.
    // If not, it's considered malformed and cannot be processed.
    if (!matchResult || matchResult.length !== 4) {
        console.warn(`Skipping malformed equation line: "${equationTextLine}"`);
        return "NA"; // Indicate no solution for malformed input.
    }

    // Destructure the matched groups for easier access:
    // [0] is the full match, [1] is the first term, [2] is the second, [3] is the result.
    const [, firstTermPattern, secondTermPattern, resultPattern] = matchResult;

    const candidateSolutions = []; // This array will store digits (0-9) that make the equation true.

    // Iterate through all single-digit possibilities for 'X' (from 0 to 9).
    for (let potentialDigit = 0; potentialDigit <= 9; potentialDigit++) {
        // Replace all occurrences of 'X' in each part of the equation with the current digit candidate.
        // Explicitly convert the digit to a string for the replacement operation.
        const resolvedFirstTermStr = firstTermPattern.replace(/X/g, String(potentialDigit));
        const resolvedSecondTermStr = secondTermPattern.replace(/X/g, String(potentialDigit));
        const resolvedResultStr = resultPattern.replace(/X/g, String(potentialDigit));

        // Convert the resolved term strings into numbers for the large addition function.
        // The Number() constructor correctly handles cases like "05" becoming 5.
        const numA = Number(resolvedFirstTermStr);
        const numB = Number(resolvedSecondTermStr);

        // Execute the arbitrary-precision addition.
        const computedSum = performLargeSum(numA, numB);

        // Compare the calculated sum (as a string) with the expected result string.
        if (computedSum === resolvedResultStr) {
            candidateSolutions.push(potentialDigit); // If they match, this digit is a valid solution.
        }
    }

    // Based on the number of valid solutions found, determine the output.
    if (candidateSolutions.length === 1) {
        // If exactly one digit satisfies the equation, return it as a string.
        return String(candidateSolutions[0]);
    } else {
        // If there are zero or multiple solutions, it's not a unique answer.
        return "NA";
    }
};

// --- Application Entry Point ---
// Define the standard input path, typically for competitive programming.
const standardInputPath = '/dev/stdin';

// Retrieve all raw input content from the specified path.
const rawInputContent = retrieveInputData(standardInputPath);

// Process the raw input:
// 1. Trim leading/trailing whitespace from the entire input.
// 2. Split the content into an array of individual problem statements (lines).
// 3. Filter out any empty lines that might result from extra newlines in the input.
const problemStatementsList = rawInputContent
    .trim()
    .split('\n')
    .filter(line => line.length > 0);

// Iterate over each parsed problem statement and print its computed solution.
for (const statementLine of problemStatementsList) {
    const currentSolution = determineXSolution(statementLine);
    console.log(currentSolution);
}