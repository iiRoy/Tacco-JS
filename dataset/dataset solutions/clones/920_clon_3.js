// This script processes numerical input from standard I/O to perform a specific parity-based evaluation.

// Utilize the Node.js file system module for input operations.
const fileInputSystem = require('fs');

// Define the standard input file path for consistency.
const stdInputSource = '/dev/stdin';

/**
 * Retrieves the raw string content from a specified file path.
 * This function encapsulates the file reading operation.
 * @param {string} sourcePath - The path to the file to be read.
 * @returns {string} The entire content of the file as a UTF-8 string.
 */
function fetchRawData(sourcePath) {
    return fileInputSystem.readFileSync(sourcePath, 'utf8');
}

/**
 * Parses a raw string of space-separated numbers into an array of numerical values.
 * This includes trimming whitespace and converting string segments to numbers.
 * @param {string} dataString - The input string containing space-separated numbers.
 * @returns {number[]} An array of numbers extracted from the input string.
 */
function convertStringToNumbers(dataString) {
    // First, remove any leading or trailing whitespace from the input string.
    const trimmedString = dataString.trim();
    // Then, split the string into an array of substrings based on space delimiters.
    const stringComponents = trimmedString.split(" ");
    // Finally, transform each string component into a numerical type.
    const numericArray = stringComponents.map(Number);
    return numericArray;
}

/**
 * Executes the core logical evaluation based on the parity of two operands.
 * The internal logic determines if both operands are odd. If so, it yields "No"; otherwise, "Yes".
 * This function effectively rephrases the original condition:
 * `((operandX * operandY + 1) % 2 === 0 && (operandX + operandY + 1) % 2 !== 0)`
 * which simplifies to `(operandX is odd AND operandY is odd)`.
 *
 * @param {number} op1 - The first numerical operand for evaluation.
 * @param {number} op2 - The second numerical operand for evaluation.
 * @returns {string} "No" if both op1 and op2 are odd; "Yes" otherwise.
 */
function performParityCheck(op1, op2) {
    // Determine if the first operand is an odd number.
    // (num % 2 !== 0) is true for odd numbers (1, 3, -1, etc.).
    const isFirstOperandOdd = (op1 % 2 !== 0);

    // Determine if the second operand is an odd number using a bitwise operation.
    // For positive integers, (num & 1) results in 1 if num is odd, and 0 if num is even.
    // This provides an alternative way to check parity.
    const isSecondOperandOdd = ((op2 & 1) === 1);

    let resultStatement; // Declare a variable to hold the outcome string.

    // The condition for returning "No" is when both operands are odd.
    if (isFirstOperandOdd && isSecondOperandOdd) {
        resultStatement = "No"; // This corresponds to the original condition being true.
    } else {
        resultStatement = "Yes"; // This corresponds to the original condition being false.
    }

    return resultStatement;
}

/**
 * Outputs a given message to the standard console.
 * This helper function centralizes the output operation.
 * @param {string} message - The string message to be displayed.
 */
function printOutput(message) {
    console.log(message);
}

// --- Primary program execution sequence ---

// Step 1: Obtain the complete input string from the designated standard input.
const fullInputString = fetchRawData(stdInputSource);

// Step 2: Transform the raw input string into an array of numerical values.
const parsedValuesArray = convertStringToNumbers(fullInputString);

// Step 3: Extract the primary operands from the parsed array.
// Note: The original problem statement included four numbers (a, b, c, d),
// but only the first two (a and b) were used in the core logic.
// Therefore, we only destructure the relevant values, effectively ignoring the others.
const [firstNumber, secondNumber] = parsedValuesArray;

// Step 4: Implement a basic validation check for the primary operands.
// If either of the main operands is not a valid number (e.g., due to parsing errors).
if (isNaN(firstNumber) || isNaN(secondNumber)) {
    printOutput("Error: One or both primary input values are not valid numbers.");
} else {
    // Step 5: Execute the core parity check logic using the validated operands.
    const finalDecision = performParityCheck(firstNumber, secondNumber);

    // Step 6: Display the determined outcome to the user.
    printOutput(finalDecision);
}